import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { RoleAdmin } from 'src/common/enum';

@Entity()
export class Admin extends BaseEntity {
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: RoleAdmin, default: RoleAdmin.ADMIN })
  role: RoleAdmin;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
