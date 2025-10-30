import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { MasterProfile } from './master-profile.entity';
import { User } from './user.entity';
import { PicturesOfOpinions } from './pictures-opinions.entity';

@Entity()
export class UserOpinions extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  comment: string;

  @Column({ nullable: false, type: 'float' })
  rating: number;

  @ManyToOne(() => MasterProfile, (master) => master.user_opinions, {
    onDelete: 'CASCADE',
  })
  master: MasterProfile;

  @ManyToOne(() => User, (user) => user.opinions, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => PicturesOfOpinions, (pictures) => pictures.opinion)
  pictures: PicturesOfOpinions[];
}
