import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRooms } from 'src/core';
import { config } from 'src/config';
import { ChatGateway } from './chat.gateway';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { RedisModule } from '../redis/redis.module';
import { RedisProvider } from '../redis/redis.provider';
import { ChatOnlineService } from './chat.online-ofline.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRooms]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
    RedisModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    JwtSocketMiddleware,
    RedisProvider,
    ChatOnlineService,
  ],
})
export class ChatModule {}
