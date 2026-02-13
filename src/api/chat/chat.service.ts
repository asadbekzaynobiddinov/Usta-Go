import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatParticipants,
  ChatParticipantsRepository,
  ChatRooms,
  ChatRoomsRepository,
} from 'src/core';
import { FindOneOptions } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryDto } from 'src/common/dto';
import { RoleAdmin } from 'src/common/enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly repository: ChatRoomsRepository,
    @InjectRepository(ChatParticipants)
    private readonly participantsRepository: ChatParticipantsRepository,
  ) {}

  async create(dto: CreateChatDto) {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(query: QueryDto, userId: string, role: RoleAdmin) {
    try {
      const skip = (query.page - 1) * query.limit;

      const chats = await this.repository
        .createQueryBuilder('chat')

        // Oxirgi message
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

        // BARCHA participants
        .leftJoinAndSelect('chat.participants', 'participants')

        .leftJoinAndSelect('chat.offers', 'offers')

        // Faqat user bor chatlarni olish
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
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(options: FindOneOptions<ChatRooms>) {
    const chat = await this.repository.findOne(options);
    if (!chat) {
      throw new NotFoundException('Chat room not found');
    }
    return {
      status_code: 200,
      message: 'Chat room fetched successfully',
      data: chat,
    };
  }

  async remove(id: string) {
    await this.findOne({ where: { id } });
    await this.repository.delete(id);
    return {
      status_code: 200,
      message: 'Chat room deleted successfully',
    };
  }
}
