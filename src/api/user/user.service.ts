/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRepository } from 'src/core';
import { CreateUserDto } from './dto/create-user.dto';
import { IFindOptions } from 'src/common/interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: UserRepository,
  ) {}
  async create(dto: CreateUserDto) {
    const userExists = await this.repository.findOne({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    try {
      const newUser = this.repository.create(dto);
      await this.repository.save(newUser);
      return {
        code: 201,
        message: 'User created succsessfuly',
        data: newUser,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(options?: IFindOptions<User>) {
    try {
      const users = await this.repository.find(options);
      return {
        code: 200,
        message: 'Users fetched succsessfuly',
        data: users,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.repository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        code: 200,
        message: 'User fetched succsessfuly',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOneById(id);
    try {
      await this.repository.update({ id }, { ...dto });
      return {
        code: 200,
        message: 'User updated succsessfuly',
        data: await this.repository.findOneBy({ id }),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: string) {
    await this.findOneById(id);
    try {
      await this.repository.delete({ id });
      return {
        code: 204,
        message: 'User deleted succsessfuly',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
