import { Socket } from 'socket.io';
import { IPayload } from '../interface';

export type MySocket = Socket & {
  user: IPayload;
};
