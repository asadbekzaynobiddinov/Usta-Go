import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatParticipants, ChatRooms } from 'src/core';
import { config } from 'src/config';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { RedisProvider } from '../redis/redis.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRooms, ChatParticipants]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, JwtSocketMiddleware],
})
export class ChatModule {}
