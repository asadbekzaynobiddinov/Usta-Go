import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class MessageHandler {
  handleSendMessage(message: string, server: Server) {
    console.log(message);
    server.emit('message:new', message);
  }
}
