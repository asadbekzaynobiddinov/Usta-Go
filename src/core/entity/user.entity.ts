import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { RoleUser } from 'src/common/enum';
import { Orders } from './orders.entity';
import { MasterService } from './master-service.entity';
import { Notifications } from './notifications.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ type: 'enum', enum: RoleUser, default: RoleUser.USER })
  role: RoleUser;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'float', default: 5 })
  rating_avg: number;

  @Column({ default: false })
  is_verified: boolean;

  @OneToMany(() => Orders, (orders) => orders.client)
  userOrders: Orders[];

  @OneToMany(() => Orders, (orders) => orders.master)
  masterOrders: Orders[];

  @OneToMany(() => MasterService, (masterService) => masterService.master)
  masterServices: MasterService[];

  @OneToMany(() => Notifications, (notifications) => notifications.user)
  notifications: Notifications[];
}
