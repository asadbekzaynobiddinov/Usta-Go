import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages, MessagesRepository } from 'src/core';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages) private readonly repository: MessagesRepository,
  ) {}
  async create(dto: CreateMessageDto) {
    const message = this.repository.create({
      chat_room: { id: dto.chat_id },
      context: dto.context,
      type: dto.type,
      sender_id: dto.sender_id,
    });
    await this.repository.save(message);
    return {
      status_code: 201,
      message: 'Message created successfully',
      data: message,
    };
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
