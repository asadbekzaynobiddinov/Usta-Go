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
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Redis } from 'ioredis';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { MySocket } from 'src/common/types';
import { IdDto, MessageBodyDto, UpdateMessageDto } from './dto';
import { MessageHandler } from './handlers/message-handler';
import { WsAllExceptionsFilter } from './filters/ws-exeption.filter';
import { ChatHandler } from './handlers/chat-handler';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseFilters(new WsAllExceptionsFilter())
@UsePipes(
  new ValidationPipe({
    transform: true,
    forbidNonWhitelisted: true,
    whitelist: true,
  }),
)
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtMiddleware: JwtSocketMiddleware,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly messageHandler: MessageHandler,
    private readonly chatHandler: ChatHandler,
  ) {}

  afterInit() {
    this.server.use(this.jwtMiddleware.use.bind(this.jwtMiddleware));
  }

  async handleConnection(client: MySocket) {
    const clientData = {
      id: client.id,
      dbId: client.user.sub,
    };
    await this.redis.set(`user:${client.user.sub}`, JSON.stringify(clientData));
    await this.redis.set(`online_users:${client.user.sub}`, 'true');
    await this.redis.del(`last_seen:${client.user.sub}`);
  }

  async handleDisconnect(client: MySocket) {
    await this.redis.del(`user:${client.user.sub}`);
    await this.redis.del(`online_users:${client.user.sub}`);

    const last_seen = new Date().toISOString();
    await this.redis.set(`last_seen:${client.user.sub}`, last_seen);
  }

  @SubscribeMessage('joinChat')
  joinChat(@MessageBody() body: IdDto, @ConnectedSocket() client: MySocket) {
    return this.chatHandler.joinChat(client, body.id);
  }

  @SubscribeMessage('leaveChat')
  leaveChat(@MessageBody() body: IdDto, @ConnectedSocket() client: MySocket) {
    return this.chatHandler.leaveChat(client, body.id);
  }

  @SubscribeMessage('message:send')
  sendMessage(
    @MessageBody() body: MessageBodyDto,
    @ConnectedSocket() client: MySocket,
  ) {
    return this.messageHandler.sendMessage(client, body);
  }

  @SubscribeMessage('message:read')
  readMessage(@MessageBody() body: IdDto, @ConnectedSocket() client: MySocket) {
    return this.messageHandler.readMessage(body.id, client);
  }

  @SubscribeMessage('message:update')
  updateMessage(
    @MessageBody() body: UpdateMessageDto,
    @ConnectedSocket() client: MySocket,
  ) {
    return this.messageHandler.updateMessage(body, client);
  }

  @SubscribeMessage('message:delete')
  deleteMessage(
    @MessageBody() body: IdDto,
    @ConnectedSocket() client: MySocket,
  ) {
    return this.messageHandler.deleteMessage(body.id, client);
  }

  @SubscribeMessage('start:typing')
  startTyping(@MessageBody() body: IdDto, @ConnectedSocket() client: MySocket) {
    return this.messageHandler.startTyping(body.id, client);
  }

  @SubscribeMessage('stop:typing')
  stopTyping(@MessageBody() body: IdDto, @ConnectedSocket() client: MySocket) {
    return this.messageHandler.stopTyping(body.id, client);
  }
}
