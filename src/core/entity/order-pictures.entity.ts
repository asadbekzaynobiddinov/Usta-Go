import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Orders } from './orders.entity';

@Entity()
export class OrderPictures extends BaseEntity {
  @Column({ nullable: false })
  picture_url: string;

  @ManyToOne(() => Orders, (order) => order.pictures, { onDelete: 'CASCADE' })
  order: Orders;
}
