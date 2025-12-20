import { Body, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { MessageBodyDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRooms, ChatRoomsRepository } from 'src/core';
import Redis from 'ioredis';

@Injectable()
export class MessageHandler {
  constructor(
    @InjectRepository(ChatRooms) private readonly chatRepo: ChatRoomsRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async handleSendMessage(message: MessageBodyDto, server: Server) {
    const chat = await this.chatRepo.findOne({
      where: { id: message.chat_id },
      relations: ['master', 'user'],
    });
    console.log(chat);
    const other = await this.redis.get(`user:${chat?.master.id}`);
    console.log(other);
    server.emit('message:new');
  }
}
