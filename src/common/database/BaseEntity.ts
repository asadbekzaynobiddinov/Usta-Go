import {
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: new Date(Date.now()),
  })
  created_at: number;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: new Date(Date.now()),
  })
  updated_at: number;
}
