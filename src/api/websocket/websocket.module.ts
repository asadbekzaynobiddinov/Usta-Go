// import { Module } from '@nestjs/common';
// import { SocketGateway } from './websocket.gateway';
// import { RedisModule } from '../redis/redis.module';
// import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
// import { JwtModule } from '@nestjs/jwt';
// import { config } from 'src/config';
// import { MessagesModule } from '../messages/messages.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatRooms, MessageAttachments, Messages } from 'src/core';
// import { MessageHandler } from './handlers/message-handler';

// @Module({
//   imports: [
//     RedisModule,
//     MessagesModule,
//     JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
//     TypeOrmModule.forFeature([Messages, ChatRooms, MessageAttachments]),
//   ],
//   providers: [SocketGateway, JwtSocketMiddleware, MessageHandler],
//   exports: [SocketGateway],
// })
// export class WebSocketModule {}
