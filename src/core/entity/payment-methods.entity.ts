import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';

@Entity()
export class PaymentMethods extends BaseEntity {
  @Column({ nullable: false })
  masked_umber: string;

  @Column({ nullable: false, type: 'text' })
  token: string;

  @Column({ nullable: false })
  epire_month: number;

  @Column({ nullable: false })
  expire_year: number;

  @Column({ nullable: true })
  card_holder: string;

  @Column({ nullable: false, type: 'boolean' })
  is_default: boolean;

  @Column({ nullable: false, type: 'boolean' })
  is_verified: boolean;

  @ManyToOne(() => User, (user) => user.payment_methods, {
    onDelete: 'CASCADE',
  })
  user: User;
}
