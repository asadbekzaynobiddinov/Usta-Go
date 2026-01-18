import { Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Messages } from './messages.entity';
import { ChatParticipants } from './chat-participants.entity';

@Entity()
export class ChatRooms extends BaseEntity {
  @OneToMany(() => Messages, (messages) => messages.chat_room)
  messages: Messages[];

  @OneToMany(() => ChatParticipants, (chp) => chp.chat)
  participants: ChatParticipants;
}
