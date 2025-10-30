import { Entity, Column, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MessageType } from 'src/common/enum';
import { User } from './user.entity';
import { ChatRooms } from './chat-rooms.entity';
import { MessageAttachments } from './message-attachments.entity';

@Entity()
export class Messages extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  context: string;

  @Column({ nullable: false, type: 'enum', enum: MessageType })
  type: MessageType;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_read: boolean;

  @Column({ nullable: true, type: 'date' })
  read_at: Date;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ChatRooms, (rooms) => rooms.messages, {
    onDelete: 'CASCADE',
  })
  chat_room: ChatRooms;

  @OneToOne(() => ChatRooms, (room) => room.last_message)
  chat: ChatRooms;

  @OneToMany(() => MessageAttachments, (ma) => ma.message)
  attachments: MessageAttachments[];
}
