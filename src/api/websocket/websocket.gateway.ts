import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageHandler } from './handlers/message.handler';
import { RedisService } from './redis.service';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private messageHandler: MessageHandler,
    private redis: RedisService,
    private jwtMiddleware: JwtSocketMiddleware,
  ) {}

  afterInit() {
    this.server.use(this.jwtMiddleware.use);
  }

  async handleConnection(client: Socket) {
    await this.redis.onConnect(client.id);
  }

  async handleDisconnect(client: Socket) {
    await this.redis.onDisconnect(client.id);
    console.log(client.id, 'disconnetcted');
  }

  @SubscribeMessage('message:send')
  messageSend(@MessageBody() body: string, @ConnectedSocket() socket: Socket) {
    this.server.emit('message:new', body);
    this.messageHandler.handleSendMessage(body, socket);
  }
}
