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
import { Server, Socket } from 'socket.io';
import { RedisService } from './redis.service';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { ChatIdDto, MessageBodyDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Messages,
  MessagesRepository,
  ChatRooms,
  ChatRoomsRepository,
} from 'src/core';
import { MySocket } from 'src/common/types';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redis: RedisService,
    private readonly jwtMiddleware: JwtSocketMiddleware,
    @InjectRepository(Messages)
    private readonly messageRepository: MessagesRepository,
    @InjectRepository(ChatRooms)
    private readonly chatRepository: ChatRoomsRepository,
  ) {}

  afterInit() {
    this.server.use(this.jwtMiddleware.use.bind(this.jwtMiddleware));
  }

  async handleConnection(client: Socket) {
    await this.redis.onConnect(client.id);
  }

  async handleDisconnect(client: Socket) {
    await this.redis.onDisconnect(client.id);
    console.log(client.id, 'disconnected');
  }

  @SubscribeMessage('chat:join')
  @UsePipes(new ValidationPipe())
  async onJoinChat(
    @MessageBody() body: ChatIdDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chatExists = await this.chatRepository.exists({
      where: { id: body.chat_id },
    });
    if (!chatExists) {
      return {
        status_code: 404,
        message: 'Chat not found',
        data: {},
      };
    }
    await client.join(`chat:${body.chat_id}`);
    return {
      status_code: 200,
      message: 'Joined to chat succsessfuly',
      data: {},
    };
  }

  @SubscribeMessage('message:send')
  async messageSend(
    @MessageBody() body: MessageBodyDto,
    @ConnectedSocket() client: MySocket,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { id: body.chat_id },
      relations: ['user', 'master'],
    });
    if (!chat) {
      return { status_code: 404, message: 'Chat not found' };
    }
    console.log(body);
    const newMessage = this.messageRepository.create({
      chat_room: { id: chat.id },
      context: body.message,
      sender_id: client.user.sub,
    });

    await this.messageRepository.save(newMessage);

    this.server.to(`chat:${body.chat_id}`).emit('message:new', {
      ...body,
    });

    return { sent: true };
  }
}
