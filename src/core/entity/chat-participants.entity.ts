import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { User } from './user.entity';
import { ChatParticipantRole } from 'src/common/enum';

@Entity()
export class ChatParticipants extends BaseEntity {
  @Column({ type: 'enum', enum: ChatParticipantRole })
  role: ChatParticipants;

  @Column({
    nullable: true,
    type: 'date',
  })
  joined_at: Date;

  @ManyToOne(() => User, (user) => user.chat_participants, {
    onDelete: 'CASCADE',
  })
  user: User;
}
