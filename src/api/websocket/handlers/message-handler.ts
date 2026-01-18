// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Inject, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import Redis from 'ioredis';
// import { Server } from 'socket.io';
// import { MySocket } from 'src/common/types';
// import {
//   ChatRooms,
//   ChatRoomsRepository,
//   MessageAttachments,
//   MessageAttachmentsRepository,
//   Messages,
//   MessagesRepository,
// } from 'src/core';
// import { MessageBodyDto, UpdateMessageDto } from '../dto';
// import { FileType } from 'src/common/enum';
// import { WsException } from '@nestjs/websockets';
// import { IReceiverData } from '../interface';

// @Injectable()
// export class MessageHandler {
//   constructor(
//     @InjectRepository(Messages) private readonly repository: MessagesRepository,
//     @InjectRepository(ChatRooms)
//     private readonly chatRepository: ChatRoomsRepository,
//     @InjectRepository(MessageAttachments)
//     private readonly messageAttachmentRepository: MessageAttachmentsRepository,
//     @Inject('REDIS_CLIENT') private readonly redis: Redis,
//   ) {}

//   async sendMessage(client: MySocket, dto: MessageBodyDto, server: Server) {
//     const chat = await this.chatRepository.findOne({
//       where: { id: dto.chat_id },
//       relations: ['master', 'user'],
//     });

//     if (!chat) {
//       throw new WsException('Chat not found');
//     }

//     const receiverId =
//       chat.master.id === client.user.sub ? chat.user.id : chat.master.id;

//     const receiverData = await this.redis.get(`user:${receiverId}`);

//     const newMessage = await this.repository.save(
//       this.repository.create({
//         chat_room: { id: chat.id },
//         sender_id: client.user.sub,
//         receiver_id: dto.receiver,
//         content: dto.content,
//       }),
//     );

//     const attachments = await Promise.all(
//       (dto.pictures ?? []).map((pic) =>
//         this.messageAttachmentRepository.save(
//           this.messageAttachmentRepository.create({
//             message: { id: newMessage.id },
//             type: FileType.IMAGE,
//             file_url: pic,
//           }),
//         ),
//       ),
//     );

//     await this.chatRepository.update(
//       { id: chat.id },
//       { last_message: { id: newMessage.id } },
//     );

//     if (receiverData) {
//       const parsedReceiver: IReceiverData = JSON.parse(receiverData);
//       server.to(parsedReceiver.id).emit('message:new', {
//         ...newMessage,
//         attachments,
//       });
//     }

//     return {
//       success: true,
//       message: {
//         ...newMessage,
//         attachments,
//       },
//     };
//   }

//   async readMessage(messageId: string, client: MySocket, server: Server) {
//     const message = await this.repository.findOne({ where: { id: messageId } });

//     if (!message) {
//       throw new WsException('Message not found');
//     }

//     message.is_read = true;

//     await this.repository.save(message);

//     const receiverId =
//       message.sender_id === client.user.sub
//         ? message.receiver_id
//         : message.sender_id;

//     const receiverData = await this.redis.get(`user:${receiverId}`);

//     if (receiverData) {
//       const parsedReceiver: IReceiverData = JSON.parse(receiverData);
//       server.to(parsedReceiver.id).emit('message:is_read', {
//         id: message.id,
//         is_read: true,
//       });
//     }

//     return {
//       success: true,
//       message: 'Message successfully read',
//     };
//   }

//   async updateMessage(dto: UpdateMessageDto, client: MySocket, server: Server) {
//     const message = await this.repository.findOne({ where: { id: dto.id } });
//     if (!message) {
//       throw new WsException('Message not found');
//     }

//     message.content = dto.content;

//     await this.repository.save(message);

//     const receiverId =
//       message.sender_id === client.user.sub
//         ? message.receiver_id
//         : message.sender_id;

//     const receiverData = await this.redis.get(`user:${receiverId}`);

//     if (receiverData) {
//       const parsedReceiver: IReceiverData = JSON.parse(receiverData);
//       server.to(parsedReceiver.id).emit('message:updated', {
//         id: message.id,
//         content: message.content,
//       });
//     }

//     return {
//       success: true,
//       message: 'Message successfully updated',
//     };
//   }

//   async deleteMessage(id: string, client: MySocket, server: Server) {
//     const message = await this.repository.findOne({ where: { id } });
//     if (!message) {
//       throw new WsException('Message not found');
//     }

//     message.is_deleted = true;

//     await this.repository.save(message);

//     const receiverId =
//       message.sender_id === client.user.sub
//         ? message.receiver_id
//         : message.sender_id;

//     const receiverData = await this.redis.get(`user:${receiverId}`);

//     if (receiverData) {
//       const parsedReceiver: IReceiverData = JSON.parse(receiverData);
//       server.to(parsedReceiver.id).emit('message:deleted', {
//         id: message.id,
//         message: 'Message deleted',
//       });
//     }

//     return {
//       success: true,
//       message: 'Message successfully deleted',
//     };
//   }

//   async startTyping(chatId: string, client: MySocket, server: Server) {
//     const chat = await this.chatRepository.findOne({ where: { id: chatId } });
//     if (!chat) {
//       throw new WsException('Chat not found');
//     }

//     const receiverId =
//       chat.master.id === client.user.sub ? chat.user.id : chat.master.id;

//     const receiverData = await this.redis.get(`user:${receiverId}`);
//     if (receiverData) {
//       const parsedReceiver: IReceiverData = JSON.parse(receiverData);
//       server.to(parsedReceiver.id).emit('user:start_typing', {
//         chatId,
//         senderId: client.user.sub,
//       });
//     }
//     return {
//       success: true,
//       message: 'Satrt typing',
//     };
//   }

//   async stopTyping(chatId: string, client: MySocket, server: Server) {
//     const chat = await this.chatRepository.findOne({ where: { id: chatId } });
//     if (!chat) {
//       throw new WsException('Chat not found');
//     }

//     const receiverId =
//       chat.master.id === client.user.sub ? chat.user.id : chat.master.id;

//     const receiverRaw = await this.redis.get(`user:${receiverId}`);
//     if (receiverRaw) {
//       const receiverData: IReceiverData = JSON.parse(receiverRaw);
//       server.to(receiverData.id).emit('user:stop_typing', {
//         chatId,
//         senderId: client.user.sub,
//       });
//     }
//     return {
//       success: true,
//       message: 'Stop typing',
//     };
//   }
// }
