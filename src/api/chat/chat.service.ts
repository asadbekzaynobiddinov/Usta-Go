import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatParticipants,
  ChatParticipantsRepository,
  ChatRooms,
  ChatRoomsRepository,
} from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';

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

  async findAll(options: FindManyOptions<ChatRooms>) {
    const chats = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Chat rooms fetched successfully',
      data: chats,
    };
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
