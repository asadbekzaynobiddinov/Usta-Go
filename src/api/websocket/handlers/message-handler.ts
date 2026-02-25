/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { MySocket } from 'src/common/types';
import {
  ChatRooms,
  ChatRoomsRepository,
  MessageAttachments,
  MessageAttachmentsRepository,
  MessageReads,
  MessageReadsRepository,
  Messages,
  MessagesRepository,
} from 'src/core';
import { MessageBodyDto, UpdateMessageDto } from '../dto';
import { FileType } from 'src/common/enum';
import { WsException } from '@nestjs/websockets';
import { IReceiverData } from '../interface';

@Injectable()
export class MessageHandler {
  constructor(
    @InjectRepository(Messages) private readonly repository: MessagesRepository,
    @InjectRepository(ChatRooms)
    private readonly chatRepository: ChatRoomsRepository,
    @InjectRepository(MessageAttachments)
    private readonly messageAttachmentRepository: MessageAttachmentsRepository,
    @InjectRepository(MessageReads)
    private readonly messageReadsRepository: MessageReadsRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async sendMessage(client: MySocket, dto: MessageBodyDto) {
    const participants = await this.redis.smembers(
      `chat:${dto.chat_id}:participants`,
    );

    if (!participants.includes(client.user.sub)) {
      throw new WsException('You are not a participant of this chat');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: dto.chat_id },
      relations: ['participants'],
    });

    if (!chat) {
      throw new WsException('Chat not found');
    }

    const sender = chat.participants.find((p) => p.user_id === client.user.sub);

    if (!sender) {
      throw new WsException('Sender not found in chat participants');
    }

    const newMessage = await this.repository.save(
      this.repository.create({
        chat_room: chat,
        content: dto.content,
        sender,
      }),
    );

    const attachments = await Promise.all(
      (dto.pictures ?? []).map((pic) =>
        this.messageAttachmentRepository.save(
          this.messageAttachmentRepository.create({
            message: { id: newMessage.id },
            type: FileType.IMAGE,
            file_url: pic,
          }),
        ),
      ),
    );

    for (const userId of participants) {
      if (userId === client.user.sub) continue;

      const receiverData = await this.redis.get(`user:${userId}`);

      if (receiverData) {
        client.to(`chat:${chat.id}`).emit('message:new', {
          ...newMessage,
          attachments,
        });
      }
    }

    return {
      success: true,
      message: 'Message successfully sent',
      data: {
        ...newMessage,
        attachments,
      },
    };
  }

  async readMessage(messageId: string, client: MySocket) {
    const message = await this.repository.findOne({
      where: { id: messageId },
      relations: ['chat_room', 'chat_room.participants'],
    });

    if (!message) {
      throw new WsException('Message not found');
    }

    const sender = message.chat_room.participants.find(
      (p) => p.user_id === client.user.sub,
    );

    if (!sender) {
      throw new WsException('You are not a participant of this chat');
    }

    const existRead = await this.messageReadsRepository.findOne({
      where: {
        message: { id: message.id },
        participant: { user_id: client.user.sub },
      },
    });

    if (existRead) {
      throw new WsException('Message already marked as read');
    }

    const newRead = await this.messageReadsRepository.save(
      this.messageReadsRepository.create({
        message,
        participant: sender,
      }),
    );

    for (const user of message.chat_room.participants) {
      if (user.id === client.user.sub) continue;

      const receiverData = await this.redis.get(`user:${user.user_id}`);

      if (receiverData) {
        client.to(`chat:${message.chat_room.id}`).emit('message:is_read', {
          ...newRead,
        });
      }
    }

    return {
      success: true,
      message: 'Message successfully read',
      data: {},
    };
  }

  async updateMessage(dto: UpdateMessageDto, client: MySocket) {
    const message = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['chat_room', 'chat_room.participants'],
    });
    if (!message) {
      throw new WsException('Message not found');
    }

    message.content = dto.content;

    await this.repository.save(message);

    const sender = message.chat_room.participants.find(
      (p) => p.user_id === client.user.sub,
    );

    if (!sender) {
      throw new WsException('You are not a participant of this chat');
    }

    for (const user of message.chat_room.participants) {
      if (user.id === client.user.sub) continue;

      const receiverData = await this.redis.get(`user:${user.user_id}`);

      if (receiverData) {
        client.to(`chat:${message.chat_room.id}`).emit('message:updated', {
          id: message.id,
          content: message.content,
        });
      }
    }

    return {
      success: true,
      message: 'Message successfully updated',
      data: message,
    };
  }

  async deleteMessage(id: string, client: MySocket) {
    const message = await this.repository.findOne({
      where: { id },
      relations: ['chat_room', 'chat_room.participants'],
    });
    if (!message) {
      throw new WsException('Message not found');
    }

    const sender = message.chat_room.participants.find(
      (p) => p.user_id === client.user.sub,
    );

    if (!sender) {
      throw new WsException('You are not a participant of this chat');
    }

    message.is_deleted = true;

    await this.repository.save(message);

    for (const user of message.chat_room.participants) {
      if (user.id === client.user.sub) continue;

      const receiverData = await this.redis.get(`user:${user.user_id}`);

      if (receiverData) {
        const parsedReceiver: IReceiverData = JSON.parse(receiverData);
        client.to(parsedReceiver.id).emit('message:deleted', {
          id: message.id,
        });
      }
    }

    return {
      success: true,
      message: 'Message successfully deleted',
      data: {},
    };
  }

  async startTyping(chatId: string, client: MySocket) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['participants'],
    });
    if (!chat) {
      throw new WsException('Chat not found');
    }

    const sender = chat.participants.find((p) => p.user_id === client.user.sub);

    if (!sender) {
      throw new WsException('You are not a participant of this chat');
    }

    client.to(`chat:${chatId}`).emit('user:start_typing', {
      chatId,
      senderId: client.user.sub,
    });

    return {
      success: true,
      message: 'Satrt typing',
      data: {},
    };
  }

  async stopTyping(chatId: string, client: MySocket) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new WsException('Chat not found');
    }

    const sender = chat.participants.find((p) => p.user_id === client.user.sub);

    if (!sender) {
      throw new WsException('You are not a participant of this chat');
    }

    client.to(`chat:${chatId}`).emit('user:stop_typing', {
      chatId,
      senderId: client.user.sub,
    });
    return {
      success: true,
      message: 'Stop typing',
    };
  }
}
