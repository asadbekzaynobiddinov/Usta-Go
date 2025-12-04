import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { MessageAttachmentsController } from './message-attachments.controller';

@Module({
  controllers: [MessageAttachmentsController],
  providers: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
