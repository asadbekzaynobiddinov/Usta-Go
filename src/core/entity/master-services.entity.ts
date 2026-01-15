import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MasterProfile } from './master-profile.entity';
import { PicturesOfMasterServices } from './pictures-master-services.entity';

@Entity()
export class MasterServices extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @OneToMany(() => PicturesOfMasterServices, (pictures) => pictures.service)
  pictures: PicturesOfMasterServices;

  @ManyToOne(() => MasterProfile, (master) => master.services, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;
}
