import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway';
import { RedisModule } from '../redis/redis.module';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { MessagesModule } from '../messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChatRooms,
  MessageAttachments,
  MessageReads,
  Messages,
} from 'src/core';
import { MessageHandler } from './handlers/message-handler';
import { ChatHandler } from './handlers/chat-handler';

@Module({
  imports: [
    RedisModule,
    MessagesModule,
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
    TypeOrmModule.forFeature([
      Messages,
      ChatRooms,
      MessageAttachments,
      MessageReads,
    ]),
  ],
  providers: [SocketGateway, JwtSocketMiddleware, MessageHandler, ChatHandler],
  exports: [SocketGateway],
})
export class WebSocketModule {}
