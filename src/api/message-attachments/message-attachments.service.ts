import { Injectable } from '@nestjs/common';
import { CreateMessageAttachmentDto } from './dto/create-message-attachment.dto';
import { UpdateMessageAttachmentDto } from './dto/update-message-attachment.dto';

@Injectable()
export class MessageAttachmentsService {
  create(createMessageAttachmentDto: CreateMessageAttachmentDto) {
    return 'This action adds a new messageAttachment';
  }

  findAll() {
    return `This action returns all messageAttachments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageAttachment`;
  }

  update(id: number, updateMessageAttachmentDto: UpdateMessageAttachmentDto) {
    return `This action updates a #${id} messageAttachment`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageAttachment`;
  }
}
