import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { TargetRole } from 'src/common/enum';

@Entity()
export class Notifications extends BaseEntity {
  @Column({ nullable: false, type: 'uuid' })
  to: string;

  @Column({ nullable: false, type: 'enum', enum: TargetRole })
  target_role: TargetRole;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
