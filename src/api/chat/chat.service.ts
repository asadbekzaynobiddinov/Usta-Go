import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatParticipants,
  ChatParticipantsRepository,
  ChatRooms,
  ChatRoomsRepository,
  MasterProfile,
  MessageReads,
  Messages,
  User,
} from 'src/core';
import { DataSource, In } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryDto } from 'src/common/dto';
import { ChatParticipantRole } from 'src/common/enum';
import { Redis } from 'ioredis';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly repository: ChatRoomsRepository,
    @InjectRepository(ChatParticipants)
    private readonly participantsRepository: ChatParticipantsRepository,
    private readonly dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(dto: CreateChatDto) {
    const chat = await this.repository.save(this.repository.create({}));
    const participants: ChatParticipants[] = [];
    for (const participant of dto.participants) {
      const newParticipant = await this.participantsRepository.save(
        this.participantsRepository.create({
          chat: { id: chat.id },
          role: participant.role,
          user_id: participant.id,
        }),
      );
      participants.push(newParticipant);
    }
    return {
      status_code: 201,
      message: 'Chat room created successfully',
      data: {
        ...chat,
        participants,
      },
    };
  }

  async findAll(query: QueryDto, userId: string, role: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        /* ===============================
        1. Chat list + count
      =============================== */

        const chatQuery = manager
          .createQueryBuilder(ChatRooms, 'chat')

          // Last message
          .leftJoinAndSelect(
            'chat.messages',
            'messages',
            `messages.id = (
            SELECT m.id
            FROM messages m
            WHERE m."chatRoomId" = chat.id
            ORDER BY m.created_at DESC
            LIMIT 1
          )`,
          )

          .leftJoinAndSelect('chat.participants', 'participants')

          .where(
            role === 'admin' || role === 'superadmin'
              ? '1=1'
              : `chat.id IN (
                SELECT cp."chatId"
                FROM chat_participants cp
                WHERE cp.user_id = :userId
              )`,
            { userId },
          )
          .leftJoinAndSelect('messages.offer', 'offer');

        const [chats, total] = await chatQuery
          .orderBy(`chat.${query.orderBy}`, query.order)
          .skip(skip)
          .take(limit)
          .getManyAndCount();

        if (!chats.length) {
          return {
            status_code: 200,
            message: 'Chat rooms fetched successfully',
            data: [],
            pagination: {
              page,
              limit,
              total,
              totalPages: 0,
            },
          };
        }

        const userIds = new Set<string>();
        const masterIds = new Set<string>();
        const chatIds = chats.map((c) => c.id);

        for (const chat of chats) {
          const user = chat.participants.find(
            (p) => p.role === ChatParticipantRole.USER,
          );

          const master = chat.participants.find(
            (p) => p.role === ChatParticipantRole.MASTER,
          );

          if (user) userIds.add(user.user_id);
          if (master) masterIds.add(master.user_id);
        }

        /* ===============================
        3. Users
      =============================== */

        const users = userIds.size
          ? await manager.find(User, {
              where: { id: In([...userIds]) },
              select: [
                'id',
                'first_name',
                'last_name',
                'phone_number',
                'avatar_url',
              ],
            })
          : [];

        const usersPipeline = this.redis.pipeline();

        users.forEach((user) => {
          usersPipeline.exists(`online_users:${user.id}`);
          usersPipeline.get(`last_seen:${user.id}`);
        });

        const usersData = await usersPipeline.exec();

        let uIndex = 0;

        const usersWithStatusAndLastSeen = users.map((user) => {
          const onlineRaw = usersData ? usersData[uIndex++][1] : null;
          const lastSeenRaw = usersData ? usersData[uIndex++][1] : null;
          return {
            ...user,
            online: onlineRaw === 1,
            last_seen: lastSeenRaw ? lastSeenRaw : null,
          };
        });

        /* ===============================
        4. Masters
      =============================== */

        const masters = masterIds.size
          ? await manager
              .createQueryBuilder(MasterProfile, 'm')
              .leftJoin('m.user', 'u')
              .where('m.id IN (:...ids)', {
                ids: [...masterIds],
              })
              .select([
                'm.id AS id',
                'm.first_name AS first_name',
                'm.last_name AS last_name',
                'm.avatar_url AS avatar_url',
                'u.phone_number AS phone_number',
              ])
              .getRawMany()
          : [];

        const mastersPipeline = this.redis.pipeline();

        masters.forEach((master) => {
          mastersPipeline.exists(`online_users:${master.id}`);
          mastersPipeline.get(`last_seen:${master.id}`);
        });

        const mastersData = await mastersPipeline.exec();

        let mIndex = 0;

        const mastersWithStatusAndLastSeen = masters.map((master) => {
          const onlineRaw = mastersData ? mastersData[mIndex++][1] : null;
          const lastSeenRaw = mastersData ? mastersData[mIndex++][1] : null;
          return {
            ...master,
            online: onlineRaw === 1,
            last_seen: lastSeenRaw ? lastSeenRaw : null,
          };
        });

        const userMap = new Map(
          usersWithStatusAndLastSeen.map((u) => [u.id, u]),
        );
        const masterMap = new Map(
          mastersWithStatusAndLastSeen.map((m) => [m.id, m]),
        );

        /* ===============================
        5. Unread messages count
      =============================== */

        const unreadRaw = await manager
          .createQueryBuilder(Messages, 'm')
          .leftJoin(
            MessageReads,
            'r',
            'r.messageId = m.id AND r.participantId = :participantId',
            { participantId: userId },
          )
          .leftJoin('m.sender', 'ms')
          .where('m.chatRoomId IN (:...ids)', { ids: chatIds })
          .andWhere('r.id IS NULL') // user hali o‘qimagan
          .andWhere('ms.user_id != :userId', { userId }) // user o‘zi yubormagan
          .groupBy('m.chatRoomId')
          .select([
            'm.chatRoomId AS chat_id',
            'COUNT(m.id)::int AS unread_count',
          ])
          .getRawMany();

        const unreadMap = new Map(
          unreadRaw.map((r) => [r.chat_id, r.unread_count]),
        );

        /* ===============================
        6. chat_with + unread biriktirish
      =============================== */

        for (const chat of chats) {
          const user = chat.participants.find(
            (p) => p.role === ChatParticipantRole.USER,
          );

          const master = chat.participants.find(
            (p) => p.role === ChatParticipantRole.MASTER,
          );

          if (role === 'admin' || role === 'superadmin') {
            chat['chat_with'] = [
              user ? userMap.get(user.user_id) : null,
              master ? masterMap.get(master.user_id) : null,
            ];
          }

          if (role === 'user') {
            chat['chat_with'] = master ? masterMap.get(master.user_id) : null;
          }

          if (role === 'master') {
            chat['chat_with'] = user ? userMap.get(user.user_id) : null;
          }

          // unread count
          chat['unread_count'] = unreadMap.get(chat.id) || 0;
        }

        /* ===============================
        7. Response
      =============================== */

        return {
          status_code: 200,
          message: 'Chat rooms fetched successfully',
          data: chats,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string, userId: string, userRole: string, query: QueryDto) {
    return await this.dataSource.transaction(async (manager) => {
      const page = query.page;
      const limit = query.limit;
      const skip = (page - 1) * limit;

      /* ===============================
      1. Chat + Participants + Offers
    =============================== */

      const chat = await manager.findOne(ChatRooms, {
        where: { id },
        relations: ['participants'],
      });

      if (!chat) {
        throw new NotFoundException('Chat room not found');
      }

      /* ===============================
      2. Messages + Reads (Pagination)
    =============================== */

      const [messages, totalMessages] = await manager
        .getRepository(Messages)
        .createQueryBuilder('m')

        .leftJoinAndSelect('m.offer', 'offer')

        .leftJoinAndSelect('m.reads', 'reads')
        .leftJoinAndSelect('reads.participant', 'participant')

        .leftJoinAndSelect('m.sender', 'sender')

        .where('m.chatRoomId = :id', { id })

        .orderBy('m.created_at', 'DESC')

        .skip(skip)
        .take(limit)

        .getManyAndCount();

      /* ===============================
      3. Sender ID larni yig‘ish
    =============================== */

      const userIds = new Set<string>();
      const masterIds = new Set<string>();

      messages.forEach((msg) => {
        if (msg.sender.role === ChatParticipantRole.USER) {
          userIds.add(msg.sender.user_id);
        } else {
          masterIds.add(msg.sender.user_id);
        }
      });

      /* ===============================
      4. Users batch load
    =============================== */

      const users = userIds.size
        ? await manager.find(User, {
            where: { id: In([...userIds]) },
            select: [
              'id',
              'first_name',
              'last_name',
              'phone_number',
              'avatar_url',
            ],
          })
        : [];

      /* ===============================
      5. Masters batch load
    =============================== */

      const masters = masterIds.size
        ? await manager
            .createQueryBuilder(MasterProfile, 'm')
            .leftJoin('m.user', 'u')
            .where('m.id IN (:...ids)', {
              ids: [...masterIds],
            })
            .select([
              'm.id AS id',
              'm.first_name AS first_name',
              'm.last_name AS last_name',
              'u.phone_number AS phone_number',
              'm.avatar_url AS avatar_url',
            ])
            .getRawMany()
        : [];

      /* ===============================
      6. Map qilish (tez lookup)
    =============================== */

      const userMap = new Map(users.map((u) => [u.id, u]));
      const masterMap = new Map(masters.map((m) => [m.id, m]));

      /* ===============================
      7. Senderlarni biriktirish
    =============================== */

      messages.forEach((msg: any) => {
        if (msg.sender.role === ChatParticipantRole.USER) {
          msg.sender = userMap.get(msg.sender.user_id) || null;
        } else {
          msg.sender = masterMap.get(msg.sender.user_id) || null;
        }
      });

      /* ===============================
      8. Reads user/master attach
    =============================== */

      messages.forEach((msg: any) => {
        msg.reads = msg.reads?.map((read) => {
          if (read.participant.role === ChatParticipantRole.USER) {
            return {
              read_at: read.read_at,
              ...userMap.get(read.participant.user_id),
            };
          }

          return {
            read_at: read.read_at,
            ...masterMap.get(read.participant.user_id),
          };
        });
      });

      /* ===============================
      9. Chat_with tayyorlash
    =============================== */

      const userParticipant = chat.participants.find(
        (p) => p.role === ChatParticipantRole.USER,
      );

      const masterParticipant = chat.participants.find(
        (p) => p.role === ChatParticipantRole.MASTER,
      );

      const participantUserIds: string[] = [];
      const participantMasterIds: string[] = [];

      if (userParticipant) {
        participantUserIds.push(userParticipant.user_id);
      }

      if (masterParticipant) {
        participantMasterIds.push(masterParticipant.user_id);
      }

      const participantUsers = participantUserIds.length
        ? await manager.find(User, {
            where: { id: In(participantUserIds) },
            select: [
              'id',
              'first_name',
              'last_name',
              'phone_number',
              'avatar_url',
            ],
          })
        : [];

      const participantMasters = participantMasterIds.length
        ? await manager
            .createQueryBuilder(MasterProfile, 'm')
            .leftJoin('m.user', 'u')
            .where('m.id IN (:...ids)', {
              ids: participantMasterIds,
            })
            .select([
              'm.id AS id',
              'm.first_name AS first_name',
              'm.last_name AS last_name',
              'u.phone_number AS phone_number',
              'm.avatar_url AS avatar_url',
            ])
            .getRawMany()
        : [];

      const participantUserMap = new Map(
        participantUsers.map((u) => [u.id, u]),
      );

      const participantMasterMap = new Map(
        participantMasters.map((m) => [m.id, m]),
      );

      let chatWith: any = null;

      if (userRole === 'admin' || userRole === 'superadmin') {
        chatWith = [
          userParticipant
            ? participantUserMap.get(userParticipant.user_id)
            : null,

          masterParticipant
            ? participantMasterMap.get(masterParticipant.user_id)
            : null,
        ];
      }

      if (userRole === 'user') {
        chatWith = masterParticipant
          ? participantMasterMap.get(masterParticipant.user_id)
          : null;
      }

      if (userRole === 'master') {
        chatWith = userParticipant
          ? participantUserMap.get(userParticipant.user_id)
          : null;
      }

      chat['chat_with'] = chatWith;

      /* ===============================
      10. Response
    =============================== */

      const { participants, ...chatData } = chat;

      return {
        status_code: 200,
        message: 'Chat fetched successfully',
        data: {
          ...chatData,
          messages,
          pagination: {
            page,
            limit,
            total: totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
          },
        },
      };
    });
  }

  async remove(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const chat = await manager.findOne(ChatRooms, {
        where: { id },
      });
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
      await manager.delete(ChatRooms, { id });
      return {
        status_code: 200,
        message: 'Chat deleted successfuly',
        data: {},
      };
    });
  }
}
