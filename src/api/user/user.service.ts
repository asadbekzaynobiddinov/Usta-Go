import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseService } from 'src/infrastructure/lib/baseService';
import { User, UserRepository } from 'src/core';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService extends BaseService<CreateUserDto, DeepPartial<User>> {
  constructor(@InjectRepository(User) repository: UserRepository) {
    super(repository);
  }
}
