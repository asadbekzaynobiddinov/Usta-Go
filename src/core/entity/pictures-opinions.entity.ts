import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { UserOpinions } from './user-opinions.entity';

@Entity()
export class PicturesOfOpinions extends BaseEntity {
  @Column({ nullable: false })
  picture_url: string;

  @ManyToOne(() => UserOpinions, (opinions) => opinions.pictures, {
    onDelete: 'CASCADE',
  })
  opinion: UserOpinions;
}
