import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';

@Entity()
export class RefreshToken extends BaseEntity {
  @Column({ nullable: false, unique: true })
  owner_id: string;

  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false, type: 'timestamptz' })
  expires_at: Date;
}
