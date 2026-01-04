import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRooms, ChatRoomsRepository } from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly repository: ChatRoomsRepository,
  ) {}

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
