import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';

@Entity()
export class VerificationCodes extends BaseEntity {
  @Column({ nullable: false })
  code: number;

  @Column({ nullable: false, type: 'timestamp' })
  valid_until: Date;

  @ManyToOne(() => User, (user) => user.verification_codes, {
    onDelete: 'CASCADE',
  })
  user: User;
}
