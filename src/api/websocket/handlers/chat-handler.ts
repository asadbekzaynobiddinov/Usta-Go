import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { MySocket } from 'src/common/types';
import { ChatRooms, ChatRoomsRepository } from 'src/core';

@Injectable()
export class ChatHandler {
  constructor(
    @InjectRepository(ChatRooms)
    private readonly chatRepository: ChatRoomsRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async joinChat(client: MySocket, chatId: string) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new WsException('Chat not found');
    }

    await this.redis.sadd(`chat:${chatId}:participants`, client.user.sub);

    await client.join(`chat:${chatId}`);

    return {
      success: true,
      message: `Successfully joined chat: ${chatId}`,
      data: {},
    };
  }

  async leaveChat(client: MySocket, chatId: string) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new WsException('Chat not found');
    }

    await this.redis.srem(`chat:${chatId}:participants`, client.user.sub);

    await client.leave(`chat:${chatId}`);

    return {
      success: true,
      message: `Successfully left chat: ${chatId}`,
      data: {},
    };
  }
}
