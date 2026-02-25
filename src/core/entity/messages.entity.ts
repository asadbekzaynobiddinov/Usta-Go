import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ChatRooms } from './chat-rooms.entity';
import { MessageAttachments } from './message-attachments.entity';
import { ChatParticipants } from './chat-participants.entity';
import { MessageReads } from './message-reads.entity';
import { MessageType } from 'src/common/enum';
import { OrderOffers } from './order-offers.entity';

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

  @Column({
    nullable: false,
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @OneToMany(() => MessageAttachments, (ma) => ma.message)
  attachments: MessageAttachments[];

  @OneToMany(() => MessageReads, (reads) => reads.message)
  reads: MessageReads[];

  @OneToOne(() => OrderOffers, (offer) => offer.joined_message, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn()
  offer: OrderOffers;
}
