import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';
import { MasterGender, MasterStatus } from 'src/common/enum';
import { MasterServices } from './master-services.entity';
import { PayoutAccounts } from './payout-accounts.entity';
import { Notifications } from './notifications.entity';
import { Orders } from './orders.entity';
import { UserOpinions } from './user-opinions.entity';

@Entity()
export class MasterProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.master_profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: '0.00',
  })
  wallet: number;

  @Column({ nullable: false, type: 'enum', enum: MasterGender })
  gender: MasterGender;

  @Column({ nullable: false })
  occupation: string;

  @Column({ nullable: true, type: 'int' })
  experience: number;

  @Column({ nullable: false })
  passport_image_url: string;

  @Column({ nullable: false })
  selfie_image_url: string;

  @Column({ nullable: false, type: 'float', default: 5.0 })
  rating_avg: number;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    country: string;
    region: string;
    city: string;
    street: string;
    building: string;
    postal_code: string;
    coordinates: { lat: number; lng: number };
    accuracy: number;
  };

  @Column({ nullable: false, type: 'enum', enum: MasterStatus })
  status: MasterStatus;

  @OneToMany(() => MasterServices, (serv) => serv.master)
  services: MasterServices[];

  @OneToMany(() => PayoutAccounts, (payoutAccounts) => payoutAccounts.master)
  payout_accounts: PayoutAccounts[];

  @OneToMany(() => Notifications, (notifications) => notifications.master)
  notifications: Notifications[];

  @OneToMany(() => Orders, (order) => order.master)
  orders: Orders[];

  @OneToMany(() => UserOpinions, (opinions) => opinions.master)
  user_opinions: UserOpinions[];
}
