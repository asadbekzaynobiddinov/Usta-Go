import { Repository } from 'typeorm';
import { Messages } from '../entity/messages.entity';

export type MessagesRepository = Repository<Messages>;
