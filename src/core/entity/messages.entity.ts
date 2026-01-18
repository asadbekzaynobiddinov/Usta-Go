import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ChatRooms } from './chat-rooms.entity';
import { MessageAttachments } from './message-attachments.entity';
import { ChatParticipants } from './chat-participants.entity';
import { MessageReads } from './message-reads.entity';
import { MessageType } from 'src/common/enum';

@Entity()
export class Messages extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  content: string;

  @ManyToOne(() => ChatParticipants, (chp) => chp.messages, {
    onDelete: 'CASCADE',
  })
  sender: ChatParticipants;

  @Column({ nullable: true, type: 'boolean' })
  is_deleted: boolean;

  @ManyToOne(() => ChatRooms, (rooms) => rooms.messages, {
    onDelete: 'CASCADE',
  })
  chat_room: ChatRooms;

  @Column({ nullable: false, type: 'enum', enum: MessageType })
  type: MessageType;

  @OneToMany(() => MessageAttachments, (ma) => ma.message)
  attachments: MessageAttachments[];

  @OneToMany(() => MessageReads, (reads) => reads.message)
  reads: MessageReads[];
}
