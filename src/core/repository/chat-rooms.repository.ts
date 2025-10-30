import { Repository } from 'typeorm';
import { ChatRooms } from '../entity/chat-rooms.entity';

export type ChatRoomsRepository = Repository<ChatRooms>;
