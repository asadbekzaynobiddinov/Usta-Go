import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MasterProfile } from './master-profile.entity';

@Entity()
export class MasterServices extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToOne(() => MasterProfile, (master) => master.services, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;
}
