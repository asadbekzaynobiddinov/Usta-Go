import { Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Messages } from './messages.entity';
import { ChatParticipants } from './chat-participants.entity';
import { OrderOffers } from './order-offers.entity';

@Entity()
export class ChatRooms extends BaseEntity {
  @OneToMany(() => Messages, (messages) => messages.chat_room)
  messages: Messages[];

  @OneToMany(() => ChatParticipants, (chp) => chp.chat)
  participants: ChatParticipants[];

  @OneToMany(() => OrderOffers, (offer) => offer.chat_room)
  offers: OrderOffers[];
}
