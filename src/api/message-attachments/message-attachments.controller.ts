import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { CreateMessageAttachmentDto } from './dto/create-message-attachment.dto';
import { UpdateMessageAttachmentDto } from './dto/update-message-attachment.dto';

@Controller('message-attachments')
export class MessageAttachmentsController {
  constructor(
    private readonly messageAttachmentsService: MessageAttachmentsService,
  ) {}

  @Post()
  create(@Body() createMessageAttachmentDto: CreateMessageAttachmentDto) {
    return this.messageAttachmentsService.create(createMessageAttachmentDto);
  }

  @Get()
  findAll() {
    return this.messageAttachmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageAttachmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageAttachmentDto: UpdateMessageAttachmentDto,
  ) {
    return this.messageAttachmentsService.update(
      +id,
      updateMessageAttachmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageAttachmentsService.remove(+id);
  }
}
