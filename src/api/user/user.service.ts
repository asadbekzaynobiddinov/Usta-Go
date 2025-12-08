import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Notifications,
  NotificationsRepository,
  User,
  UserRepository,
} from 'src/core';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: UserRepository,
    @InjectRepository(Notifications)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}
  async create(dto: CreateUserDto) {
    const userExists = await this.repository.findOne({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const newUser = this.repository.create(dto);
    await this.repository.save(newUser);
    return {
      status_code: 201,
      message: 'User created succsessfuly',
      data: newUser,
    };
  }

  async findAll(options?: FindManyOptions<User>) {
    const users = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Users fetched succsessfuly',
      data: users,
    };
  }

  async findOneById(id: string) {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['master_profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      status_code: 200,
      message: 'User fetched succsessfuly',
      data: user,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOneById(id);

    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'User updated succsessfuly',
      data: await this.repository.findOneBy({ id }),
    };
  }

  async delete(id: string) {
    await this.findOneById(id);

    await this.repository.delete({ id });
    return {
      status_code: 204,
      message: 'User deleted succsessfuly',
    };
  }
}
