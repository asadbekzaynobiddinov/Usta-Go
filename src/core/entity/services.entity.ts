import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Orders } from './orders.entity';
import { MasterService } from './master-service.entity';

@Entity()
export class Services extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  picture: string[];

  @OneToMany(() => Orders, (orders) => orders.service)
  orders: Orders[];

  @OneToMany(() => MasterService, (masterService) => masterService.service)
  masterServices: MasterService[];
}
