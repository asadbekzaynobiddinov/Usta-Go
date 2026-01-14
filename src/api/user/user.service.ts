/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Notifications,
  NotificationsRepository,
  User,
  UserRepository,
} from 'src/core';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindManyOptions } from 'typeorm';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: UserRepository,
    @InjectRepository(Notifications)
    private readonly notificationsRepository: NotificationsRepository,
  ) {}
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

    const { password, ...updateData } = dto;

    if (password) {
      const hashedPassword = await BcryptEncryption.encrypt(password);
      await this.repository.update(
        { id },
        { ...updateData, password: hashedPassword },
      );
    }

    await this.repository.update({ id }, { ...updateData });
    return {
      status_code: 200,
      message: 'User updated succsessfuly',
      data: await this.repository.findOne({
        where: { id },
        select: [
          'id',
          'first_name',
          'last_name',
          'phone_number',
          'password',
          'language',
          'account_status',
          'updated_at',
          'created_at',
        ],
      }),
    };
  }

  async delete(id: string) {
    await this.findOneById(id);

    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'User deleted succsessfuly',
      data: {},
    };
  }
}
