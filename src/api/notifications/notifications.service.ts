import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications, NotificationsRepository } from 'src/core';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly repository: NotificationsRepository,
  ) {}
  async findAll(options: FindManyOptions<Notifications>) {
    const notifications = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Notifications fetched successfully',
      data: notifications,
    };
  }

  async findOne(id: string) {
    const notification = await this.repository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return {
      status_code: 200,
      message: 'Notification fetched successfully',
      data: notification,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Notification deleted successefully',
      data: {},
    };
  }
}
