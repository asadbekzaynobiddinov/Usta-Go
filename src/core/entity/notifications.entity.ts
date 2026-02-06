import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';

@Entity()
export class Notifications extends BaseEntity {
  @Column({ nullable: false, type: 'uuid' })
  to: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
