/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtSocketMiddleware } from 'src/common/middleware/jwt-socket.middleware';
import { ChatOnlineService } from './chat.online-ofline.service';

@WebSocketGateway(3001, { namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private chatOnlineService: ChatOnlineService,
    private jwtMiddleware: JwtSocketMiddleware,
  ) {}

  afterInit(server: any) {
    server.use(this.jwtMiddleware.use);
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(client: Socket, payload: any) {
    const userId = client.data.sub as string;
    const userStatus = await this.chatOnlineService.isOnline(userId);
    this.server.emit('usersendsms', {
      userId,
      online: userStatus,
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.data.user.sub as string;
    console.log(client.data);
    await this.chatOnlineService.onConnect(userId);
    console.log(userId);
    this.server.emit('userStatusChanged', {
      userId,
      status: 'online',
    });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user.sub as string;
    await this.chatOnlineService.onDisconnect(userId);
    console.log(userId);
    this.server.emit('userStatusChanged', {
      userId,
      status: 'offline',
    });
  }
}
