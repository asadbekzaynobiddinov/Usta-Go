import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { Messages } from './messages.entity';
import { FileType } from 'src/common/enum';

@Entity()
export class MessageAttachments extends BaseEntity {
  @ManyToOne(() => Messages, (msg) => msg.attachments, { onDelete: 'CASCADE' })
  message: Messages;

  @Column({ nullable: false, type: 'text' })
  file_url: string;

  @Column({ nullable: false, type: 'enum', enum: FileType })
  type: FileType;
}
