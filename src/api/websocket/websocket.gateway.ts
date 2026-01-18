// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// import {
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   OnGatewayInit,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server } from 'socket.io';
// import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
// import { Redis } from 'ioredis';
// import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
// import { MySocket } from 'src/common/types';
// import { MessageBodyDto, MessageIdDto, UpdateMessageDto } from './dto';
// import { MessageHandler } from './handlers/message-handler';
// import { WsAllExceptionsFilter } from './filters/ws-exeption.filter';

// @WebSocketGateway({
//   cors: { origin: '*' },
// })
// @UseFilters(new WsAllExceptionsFilter())
// @UsePipes(
//   new ValidationPipe({
//     transform: true,
//     forbidNonWhitelisted: true,
//     whitelist: true,
//   }),
// )
// export class SocketGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   constructor(
//     private readonly jwtMiddleware: JwtSocketMiddleware,
//     @Inject('REDIS_CLIENT') private readonly redis: Redis,
//     private readonly messageHandler: MessageHandler,
//   ) {}

//   afterInit() {
//     this.server.use(this.jwtMiddleware.use.bind(this.jwtMiddleware));
//   }

//   async handleConnection(client: MySocket) {
//     const clientData = {
//       id: client.id,
//       dbId: client.user.sub,
//     };
//     await this.redis.set(`user:${client.user.sub}`, JSON.stringify(clientData));
//   }

//   async handleDisconnect(client: MySocket) {
//     await this.redis.del(`user:${client.user.sub}`);
//   }

//   @SubscribeMessage('message:send')
//   sendMessage(
//     @MessageBody() body: MessageBodyDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.sendMessage(client, body, this.server);
//   }

//   @SubscribeMessage('message:read')
//   readMessage(
//     @MessageBody() body: MessageIdDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.readMessage(body.id, client, this.server);
//   }

//   @SubscribeMessage('message:update')
//   updateMessage(
//     @MessageBody() body: UpdateMessageDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.updateMessage(body, client, this.server);
//   }

//   @SubscribeMessage('message:delete')
//   deleteMessage(
//     @MessageBody() body: MessageIdDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.deleteMessage(body.id, client, this.server);
//   }

//   @SubscribeMessage('start:typing')
//   startTyping(
//     @MessageBody() body: MessageIdDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.startTyping(body.id, client, this.server);
//   }

//   @SubscribeMessage('stop:typing')
//   stopTyping(
//     @MessageBody() body: MessageIdDto,
//     @ConnectedSocket() client: MySocket,
//   ) {
//     return this.messageHandler.stopTyping(body.id, client, this.server);
//   }
// }
