import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { RoleUser } from 'src/common/enum';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false })
  full_name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: RoleUser })
  role: RoleUser;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'float', default: 5 })
  rating_avg: number;

  @Column({ default: 0 })
  review_count: number;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  is_vertfied: boolean;
}
