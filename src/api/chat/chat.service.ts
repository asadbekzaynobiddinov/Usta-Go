/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatParticipants,
  ChatParticipantsRepository,
  ChatRooms,
  ChatRoomsRepository,
  MasterProfile,
  User,
} from 'src/core';
import { DataSource } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryDto } from 'src/common/dto';
import { ChatParticipantRole, RoleAdmin } from 'src/common/enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly repository: ChatRoomsRepository,
    @InjectRepository(ChatParticipants)
    private readonly participantsRepository: ChatParticipantsRepository,
    private readonly dataSource: DataSource,
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
    const skip = (query.page - 1) * query.limit;

    const chats = await this.repository
      .createQueryBuilder('chat')

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

      .leftJoinAndSelect('messages.reads', 'reads')

      .leftJoinAndSelect('chat.participants', 'participants')

      .leftJoinAndSelect('chat.offers', 'offers')

      .where(
        role === RoleAdmin.ADMIN || role === RoleAdmin.SUPERADMIN
          ? '1=1'
          : `chat.id IN (
          SELECT cp."chatId"
          FROM chat_participants cp
          WHERE cp.user_id = :userId
        )`,
        { userId },
      )

      .skip(skip)
      .take(query.limit)
      .orderBy(`chat.${query.orderBy}`, query.order)

      .getMany();

    return {
      status_code: 200,
      message: 'Chat rooms fetched successfully',
      data: chats,
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    return await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder(ChatRooms, 'chat')
        .leftJoinAndSelect('chat.messages', 'messages')
        .leftJoinAndSelect('messages.reads', 'reads')
        .leftJoinAndSelect('reads.participant', 'reads_participant')
        .leftJoin(
          User,
          'reads_user',
          'reads_user.id = reads_participant.user_id::uuid AND reads_participant.role = :user_read_role',
          { user_read_role: ChatParticipantRole.USER },
        )
        .addSelect([
          'reads_user.id',
          'reads_user.first_name',
          'reads_user.last_name',
          'reads_user.phone_number',
          'reads_user.avatar_url',
        ])
        .leftJoin(
          MasterProfile,
          'reads_master',
          'reads_master.id = reads_participant.user_id::uuid AND reads_participant.role = :master_read_role',
          { master_read_role: ChatParticipantRole.MASTER },
        )
        .addSelect([
          'reads_master.id',
          'reads_master.first_name',
          'reads_master.last_name',
          'reads_master.avatar_url',
        ])
        .leftJoin('reads_master.user', 'reads_master_user')
        .addSelect(['reads_master_user.phone_number'])
        .leftJoinAndSelect('messages.sender', 'sender')
        .leftJoin(
          User,
          'u',
          'u.id = sender.user_id::uuid AND sender.role = :user_role',
          { user_role: ChatParticipantRole.USER },
        )
        .addSelect([
          'u.id',
          'u.first_name',
          'u.last_name',
          'u.phone_number',
          'u.avatar_url',
        ])
        .leftJoin(
          MasterProfile,
          'm',
          'm.id = sender.user_id::uuid AND sender.role = :master_role',
          { master_role: ChatParticipantRole.MASTER },
        )
        .addSelect(['m.id', 'm.first_name', 'm.last_name', 'm.avatar_url'])
        .leftJoin('m.user', 'masterUser')
        .addSelect(['masterUser.phone_number'])
        .leftJoinAndSelect('chat.participants', 'participants')
        .addSelect(['participants.user_id', 'participants.role'])
        .leftJoinAndSelect('chat.offers', 'offers')
        .where('chat.id = :id', { id })
        .getRawAndEntities();

      const chat = result.entities[0];
      const raw = result.raw;

      if (!chat) throw new NotFoundException('Chat room not found');

      chat.messages = chat.messages.map((msg) => {
        const relatedRows = raw.filter((r) => r.messages_id === msg.id);

        const mappedReads = msg.reads?.map((read) => {
          const row = relatedRows.find((r) => r.reads_id === read.id);
          if (!row) return null;

          return read.participant.role === ChatParticipantRole.USER
            ? {
                id: row.reads_user_id,
                first_name: row.reads_user_first_name,
                last_name: row.reads_user_last_name,
                phone_number: row.reads_user_phone_number,
                avatar_url: row.reads_user_avatar_url,
                read_at: read.read_at,
              }
            : {
                id: row.reads_master_id,
                first_name: row.reads_master_first_name,
                last_name: row.reads_master_last_name,
                avatar_url: row.reads_master_avatar_url,
                phone_number: row.reads_master_user_phone_number,
                read_at: read.read_at,
              };
        });

        const senderRow = relatedRows[0];

        const senderData =
          msg.sender.role === ChatParticipantRole.USER
            ? {
                id: senderRow.u_id,
                first_name: senderRow.u_first_name,
                last_name: senderRow.u_last_name,
                phone_number: senderRow.u_phone_number,
                avatar_url: senderRow.u_avatar_url,
              }
            : {
                id: senderRow.m_id,
                first_name: senderRow.m_first_name,
                last_name: senderRow.m_last_name,
                phone_number: senderRow.masterUser_phone_number,
                avatar_url: senderRow.m_avatar_url,
              };

        return {
          ...msg,
          sender: senderData as any,
          reads: mappedReads as any,
        };
      });

      const userParticipant = chat.participants.find(
        (p) => p.role === ChatParticipantRole.USER,
      );
      const masterParticipant = chat.participants.find(
        (p) => p.role === ChatParticipantRole.MASTER,
      );

      if (userRole === 'admin' || userRole === 'superadmin') {
        chat['chat_with'] = await Promise.all([
          userParticipant
            ? manager.findOne(User, {
                where: { id: userParticipant.user_id },
                select: [
                  'id',
                  'first_name',
                  'last_name',
                  'phone_number',
                  'avatar_url',
                ],
              })
            : null,
          masterParticipant
            ? manager
                .createQueryBuilder(MasterProfile, 'm')
                .leftJoinAndSelect('m.user', 'user')
                .where('m.id = :masterId', {
                  masterId: masterParticipant.user_id,
                })
                .select([
                  'm.id',
                  'm.first_name',
                  'm.last_name',
                  'm.avatar_url',
                  'user.phone_number',
                ])
                .getOne()
            : null,
        ]);
      } else if (userRole === 'user') {
        chat['chat_with'] = masterParticipant
          ? await manager
              .createQueryBuilder(MasterProfile, 'm')
              .leftJoinAndSelect('m.user', 'user')
              .where('m.id = :masterId', {
                masterId: masterParticipant.user_id,
              })
              .select([
                'm.id',
                'm.first_name',
                'm.last_name',
                'm.avatar_url',
                'user.phone_number',
              ])
              .getOne()
          : null;
      } else if (userRole === 'master') {
        chat['chat_with'] = userParticipant
          ? await manager.findOne(User, {
              where: { id: userParticipant.user_id },
              select: [
                'id',
                'first_name',
                'last_name',
                'phone_number',
                'avatar_url',
              ],
            })
          : null;
      }

      chat.messages.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return chat;
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
