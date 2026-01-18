import { Repository } from 'typeorm';
import { MessageReads } from '../entity/message-reads.entity';

export type MessageReadsRepository = Repository<MessageReads>;
