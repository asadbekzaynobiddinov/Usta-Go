import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MessageType } from 'src/common/enum';
import { ChatRooms } from './chat-rooms.entity';
import { MessageAttachments } from './message-attachments.entity';

@Entity()
export class Messages extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  context: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_read: boolean;

  @Column({ nullable: true, type: 'date' })
  read_at: Date;

  @Column({ nullable: false })
  sender_id: string;

  @ManyToOne(() => ChatRooms, (rooms) => rooms.messages, {
    onDelete: 'CASCADE',
  })
  chat_room: ChatRooms;

  @OneToMany(() => MessageAttachments, (ma) => ma.message)
  attachments: MessageAttachments[];
}
