import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';
import { MasterProfile } from './master-profile.entity';
import { TargetRole } from 'src/common/enum';

@Entity()
export class Notifications extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'text' })
  body: string;

  @Column({ nullable: false, type: 'enum', enum: TargetRole })
  target_role: TargetRole;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => MasterProfile, (master) => master.notifications, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;
}
