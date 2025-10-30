import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { OrderOfferStatus } from 'src/common/enum';

@Entity()
export class OrderOffers extends BaseEntity {
  @Column({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  offered_price: number;

  @Column({ nullable: true, type: 'text' })
  message: string;

  @Column({ nullable: false, type: 'enum', enum: OrderOfferStatus })
  status: OrderOfferStatus;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_seen: boolean;
}
