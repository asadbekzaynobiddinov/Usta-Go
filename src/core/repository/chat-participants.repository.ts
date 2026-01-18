import { Repository } from 'typeorm';
import { ChatParticipants } from '../entity/chat-participants.entity';

export type ChatParticipantsRepository = Repository<ChatParticipants>;
