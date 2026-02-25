import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { OrderOfferStatus } from 'src/common/enum';
import { Orders } from './orders.entity';
import { MasterProfile } from './master-profile.entity';
import { ChatRooms } from './chat-rooms.entity';
import { Messages } from './messages.entity';

@Entity()
export class OrderOffers extends BaseEntity {
  @Column({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  offered_price: number;

  @Column({ nullable: true, type: 'text' })
  message: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: OrderOfferStatus,
    default: OrderOfferStatus.PENDING,
  })
  status: OrderOfferStatus;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_seen: boolean;

  @ManyToOne(() => Orders, (order) => order.offers, { onDelete: 'CASCADE' })
  order: Orders;

  @ManyToOne(() => MasterProfile, (master) => master.offers, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;

  @ManyToOne(() => ChatRooms, (chat) => chat.offers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  chat_room: ChatRooms;

  @OneToOne(() => Messages, (message) => message.offer, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  joined_message: Messages;
}
