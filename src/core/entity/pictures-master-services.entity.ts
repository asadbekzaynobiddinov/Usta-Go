import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MasterServices } from './master-services.entity';

@Entity()
export class PicturesOfMasterServices extends BaseEntity {
  @ManyToOne(() => MasterServices, (services) => services.pictures, {
    onDelete: 'CASCADE',
  })
  service: MasterServices;

  @Column({ nullable: false, type: 'varchar' })
  picture_url: string;
}
