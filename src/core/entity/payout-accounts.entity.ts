import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MasterProfile } from './master-profile.entity';
import { PayoutAccountsEnum } from 'src/common/enum';

@Entity()
export class PayoutAccounts extends BaseEntity {
  @ManyToOne(() => MasterProfile, (master) => master.payout_accounts, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: false })
  account_number: string;

  @Column({ nullable: false })
  iban: string;

  @Column({ nullable: false })
  holder_name: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: PayoutAccountsEnum,
    default: PayoutAccountsEnum.PENDING,
  })
  status: PayoutAccountsEnum;

  @Column({ nullable: false, type: 'boolean', default: false })
  is_default: boolean;
}
