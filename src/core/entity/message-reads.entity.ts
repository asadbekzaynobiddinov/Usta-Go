import { Entity, ManyToOne, CreateDateColumn } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Messages } from './messages.entity';
import { ChatParticipants } from './chat-participants.entity';

@Entity()
export class MessageReads extends BaseEntity {
  @ManyToOne(() => Messages, (message) => message.reads, {
    onDelete: 'CASCADE',
  })
  message: Messages;

  @ManyToOne(() => ChatParticipants, { onDelete: 'CASCADE' })
  participant: ChatParticipants;

  @CreateDateColumn()
  read_at: Date;
}
