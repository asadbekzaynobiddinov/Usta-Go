import { Repository } from 'typeorm';
import { MessageAttachments } from '../entity/message-attachments.entity';

export type MessageAttachmentsRepository = Repository<MessageAttachments>;
