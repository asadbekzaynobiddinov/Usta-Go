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
import { MySocket } from 'src/common/types';
import { MessageBodyDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatRooms,
  ChatRoomsRepository,
  MessageAttachments,
  MessageAttachmentsRepository,
  Messages,
  MessagesRepository,
} from 'src/core';
import { FileType } from 'src/common/enum';

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
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(Messages)
    private readonly messageRepository: MessagesRepository,
    @InjectRepository(MessageAttachments)
    private readonly messageAttachmentRepository: MessageAttachmentsRepository,
    @InjectRepository(ChatRooms)
    private readonly chatRepository: ChatRoomsRepository,
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
  }

  async handleDisconnect(client: MySocket) {
    await this.redis.del(`user:${client.user.sub}`);
  }

  @SubscribeMessage('message:send')
  async messageSend(
    @MessageBody() body: MessageBodyDto,
    @ConnectedSocket() client: MySocket,
  ) {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: body.chat_id },
        relations: ['master', 'user'],
      });

      if (!chat) throw new Error('Chat not found');

      const receiverId =
        chat.master.id === client.user.sub ? chat.user.id : chat.master.id;

      const receiverData = await this.redis.get(`user:${receiverId}`);
      if (!receiverData) throw new Error('Receiver not found');

      const parsedReceiver = JSON.parse(receiverData);

      const newMessage = await this.messageRepository.save(
        this.messageRepository.create({
          chat_room: { id: chat.id },
          sender_id: client.user.sub,
          context: body.message,
        }),
      );

      const attachments = await Promise.all(
        (body.pictures ?? []).map((pic) =>
          this.messageAttachmentRepository.save(
            this.messageAttachmentRepository.create({
              message: { id: newMessage.id },
              type: FileType.IMAGE,
              file_url: pic,
            }),
          ),
        ),
      );

      this.server.to(parsedReceiver.id).emit('message:new', {
        ...newMessage,
        attachments,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
