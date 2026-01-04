import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ChatRooms } from './chat-rooms.entity';
import { MessageAttachments } from './message-attachments.entity';

@Entity()
export class Messages extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_read: boolean;

  @Column({ nullable: false })
  sender_id: string;

  @Column({ nullable: false })
  receiver_id: string;

  @Column({ nullable: true, type: 'boolean' })
  is_deleted: boolean;

  @ManyToOne(() => ChatRooms, (rooms) => rooms.messages, {
    onDelete: 'CASCADE',
  })
  chat_room: ChatRooms;

  @OneToOne(() => ChatRooms, (chat) => chat.last_message, {
    onDelete: 'SET NULL',
  })
  chat: ChatRooms;

  @OneToMany(() => MessageAttachments, (ma) => ma.message)
  attachments: MessageAttachments[];
}
