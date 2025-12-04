import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatRooms, ChatRoomsRepository } from 'src/core';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly repository: ChatRoomsRepository,
  ) {}
  async create(dto: CreateChatDto) {
    const chat = this.repository.create({
      user: { id: dto.user_id },
      master: { id: dto.master_id },
    });
    await this.repository.save(chat);
    return {
      status_code: 201,
      message: 'Chat room created succsessfully',
      data: chat,
    };
  }

  async findAll() {
    const chats = await this.repository.find({});
    return {
      status_code: 200,
      message: 'Chat rooms fetched successfully',
      data: chats,
    };
  }

  async findOne(id: string) {
    const chat = await this.repository.findOne({
      where: { id },
    });
    if (!chat) {
      throw new NotFoundException('Chat room not found');
    }
    return {
      status_code: 200,
      message: 'Chat room fetched successfully',
      data: chat,
    };
  }

  // async update(id: string, dto: UpdateChatDto) {
  //   await this.findOne(id);
  //   await this.repository.update(id, {});
  //   const updatedChat = await this.repository.findOne({
  //     where: { id },
  //     relations: ['user', 'master', 'messages', 'last_message'],
  //   });
  //   return {
  //     status_code: 200,
  //     message: 'Chat room updated successfully',
  //     data: updatedChat,
  //   };
  // }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
    return {
      status_code: 200,
      message: 'Chat room deleted successfully',
    };
  }
}
