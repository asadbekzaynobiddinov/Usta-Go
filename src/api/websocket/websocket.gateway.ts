/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { MessageBodyDto } from './dto';
import { MySocket } from 'src/common/types';
import { MessageHandler } from './handlers/message.handler';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtMiddleware: JwtSocketMiddleware,
    private readonly messageHandler: MessageHandler,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  afterInit() {
    this.server.use(this.jwtMiddleware.use.bind(this.jwtMiddleware));
  }

  async handleConnection(client: MySocket) {
    const clientData = {
      id: client.id,
      dbId: client.user.sub,
    };
    await this.redis.hset(`user:${client.user.sub}`, clientData);
  }

  async handleDisconnect(client: MySocket) {
    await this.redis.del(`user:${client.user.sub}`);
  }

  @SubscribeMessage('chat:join')
  onJoinChat(@ConnectedSocket() client: MySocket) {
    console.log(client.user.sub);
  }

  @SubscribeMessage('message:send')
  messageSend(
    @MessageBody() body: MessageBodyDto,
    @ConnectedSocket() client: MySocket,
  ) {
    body.sender_id = client.user.sub;
    return this.messageHandler.handleSendMessage(body, this.server);
  }
}
