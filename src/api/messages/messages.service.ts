import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages, MessagesRepository } from 'src/core';
import { CreateMessageDto } from './dto/create-message.dto';
// import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages) private readonly repository: MessagesRepository,
  ) {}
  async create(dto: CreateMessageDto) {
    const message = this.repository.create({
      chat: { id: dto.chat_id },
      user: { id: dto.sender_id },
      context: dto.context,
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

  // update(id: number, updateMessageDto: UpdateMessageDto) {
  //   return `This action updates a #${id} message`;
  // }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
