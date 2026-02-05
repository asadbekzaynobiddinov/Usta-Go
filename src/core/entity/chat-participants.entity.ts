import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ChatRooms } from './chat-rooms.entity';
import { ChatParticipantRole } from 'src/common/enum';
import { Messages } from './messages.entity';

@Entity()
export class ChatParticipants extends BaseEntity {
  @ManyToOne(() => ChatRooms, (chat) => chat.participants, {
    onDelete: 'CASCADE',
  })
  chat: ChatRooms;

  @Column()
  user_id: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ChatParticipantRole,
  })
  role: ChatParticipantRole;

  @OneToMany(() => Messages, (messages) => messages.sender)
  messages: Messages[];

  @CreateDateColumn()
  joined_at: Date;
}
