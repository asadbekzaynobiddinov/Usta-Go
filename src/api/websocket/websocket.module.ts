import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway';
import { MessageHandler } from './handlers/message.handler';
import { RedisModule } from '../redis/redis.module';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { MessagesModule } from '../messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRooms, Messages } from 'src/core';

@Module({
  imports: [
    RedisModule,
    MessagesModule,
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
    TypeOrmModule.forFeature([Messages, ChatRooms]),
  ],
  providers: [SocketGateway, MessageHandler, JwtSocketMiddleware],
  exports: [SocketGateway],
})
export class WebSocketModule {}
