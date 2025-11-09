import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'created_at',
    type: 'date',
    default: new Date(Date.now()),
  })
  created_at: number;

  @Column({
    name: 'updated_at',
    type: 'date',
    default: new Date(Date.now()),
  })
  updated_at: number;
}
