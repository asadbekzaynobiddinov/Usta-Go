import { Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';
import { Messages } from './messages.entity';

@Entity()
export class ChatRooms extends BaseEntity {
  @ManyToOne(() => User, (user) => user.chats, { onDelete: 'SET NULL' })
  user: User;

  @OneToMany(() => Messages, (messages) => messages.chat_room)
  messages: Messages[];

  @OneToOne(() => Messages, (messages) => messages.chat, {
    onDelete: 'SET NULL',
  })
  last_message: Messages;
}
