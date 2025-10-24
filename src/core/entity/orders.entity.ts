import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { OrderStatus } from 'src/common/enum';
import { User } from './user.entity';
import { Services } from './services.entity';

@Entity()
export class Orders extends BaseEntity {
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  price: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ACTIVE })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.userOrders, { onDelete: 'CASCADE' })
  client: User;

  @ManyToOne(() => User, (user) => user.masterOrders, { onDelete: 'SET NULL' })
  master: User;

  @ManyToOne(() => Services, (services) => services.orders, {
    onDelete: 'SET NULL',
  })
  service: Services;
}
