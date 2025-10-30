import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { OrderStatus } from 'src/common/enum';
import { User } from './user.entity';
import { MasterProfile } from './master-profile.entity';
import { OrderPictures } from './order-pictures.entity';

@Entity()
export class Orders extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => MasterProfile, (master) => master.orders)
  master: MasterProfile;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ACTIVE,
  })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: false })
  address: {
    country: string;
    region: string;
    city: string;
    street: string;
    building: string;
    postalCode: string;
    coordinates: { lat: number; lng: number };
  };

  @Column({ nullable: true, type: 'date' })
  scheduled_at: Date;

  @Column({ nullable: true, type: 'date' })
  completed_at: Date;

  @Column({ nullable: true, type: 'date' })
  canceled_at: Date;

  @Column({ nullable: true, type: 'text' })
  cancel_reason: string;

  @OneToMany(() => OrderPictures, (pictures) => pictures.order)
  pictures: OrderPictures[];
}
