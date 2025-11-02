import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRepository } from 'src/core';
import { BaseService } from 'src/infrastructure/lib/baseService';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserService extends BaseService<CreateUserDto, DeepPartial<User>> {
  constructor(@InjectRepository(User) repository: UserRepository) {
    super(repository);
  }
}
