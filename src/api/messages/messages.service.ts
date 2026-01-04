import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages, MessagesRepository } from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages) private readonly repository: MessagesRepository,
  ) {}

  async findAll(options: FindManyOptions<Messages>) {
    const messages = await this.repository.find(options);
    return {
      statsu_code: 200,
      message: 'Messages fetched succsessfuly',
      data: messages,
    };
  }

  async findOne(options: FindOneOptions<Messages>) {
    const message = await this.repository.findOne(options);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
  }
}
