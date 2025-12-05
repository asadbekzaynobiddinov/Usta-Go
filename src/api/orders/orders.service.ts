import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders, OrdersRepository } from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private readonly repository: OrdersRepository,
  ) {}
  async create(dto: CreateOrderDto) {
    const newOrder = this.repository.create({
      user: { id: dto.user_id },
      ...dto,
    });
    await this.repository.save(newOrder);
    return {
      status_code: 201,
      message: 'Order created succsessfuly',
      data: newOrder,
    };
  }

  async findAll(options?: FindManyOptions<Orders>) {
    const orders = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Orders fetched succsessfuly',
      data: orders,
    };
  }

  async findOne(options: FindOneOptions<Orders>) {
    const order = await this.repository.findOne(options);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return {
      status_code: 200,
      message: 'Order fetched succsessfuly',
      data: order,
    };
  }

  async update(id: string, dto: UpdateOrderDto, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Order updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Order deleted succsessfuly',
      data: {},
    };
  }
}
