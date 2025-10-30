import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'created_at',
    type: 'bigint',
    default: Date.now(),
  })
  created_at: number;

  @Column({
    name: 'updated_at',
    type: 'bigint',
    default: Date.now(),
  })
  updated_at: number;
}
