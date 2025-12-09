import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { UserLang } from 'src/common/enum';
import { MasterProfile } from './master-profile.entity';
import { Notifications } from './notifications.entity';
import { Orders } from './orders.entity';
import { UserOpinions } from './user-opinions.entity';
import { PaymentMethods } from './payment-methods.entity';
import { ChatRooms } from './chat-rooms.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: UserLang,
    default: UserLang.RU,
  })
  language: UserLang;

  @OneToOne(() => MasterProfile, (master) => master.user)
  master_profile: MasterProfile;

  @OneToMany(() => Notifications, (notifications) => notifications.user)
  notifications: Notifications[];

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];

  @OneToMany(() => UserOpinions, (opinions) => opinions.user)
  opinions: UserOpinions[];

  @OneToMany(() => PaymentMethods, (payments) => payments.user)
  payment_methods: PaymentMethods[];

  @OneToMany(() => ChatRooms, (chats) => chats.user)
  chats: ChatRooms[];
}
