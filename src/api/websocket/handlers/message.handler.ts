import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MessageHandler {
  handleSendMessage(message: string, socket: Socket) {
    console.log(message);
    socket.emit('message-new', message);
  }
}
