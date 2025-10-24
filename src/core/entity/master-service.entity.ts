import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';
import { Services } from './services.entity';

@Entity()
export class MasterService extends BaseEntity {
  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  experience: number;

  @ManyToOne(() => User, (user) => user.masterServices, { onDelete: 'CASCADE' })
  master: User;

  @ManyToOne(() => Services, (services) => services.masterServices, {
    onDelete: 'CASCADE',
  })
  service: Services;
}
