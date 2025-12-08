import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway';
import { MessageHandler } from './handlers/message.handler';
import { RedisService } from './redis.service';
import { RedisModule } from '../redis/redis.module';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';

@Module({
  imports: [
    RedisModule,
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  providers: [SocketGateway, RedisService, MessageHandler, JwtSocketMiddleware],
  exports: [SocketGateway],
})
export class WebSocketModule {}
