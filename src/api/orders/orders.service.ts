import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders, OrdersRepository } from 'src/core';
import { IFindOptions } from 'src/common/interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private readonly repository: OrdersRepository,
  ) {}
  async create(dto: CreateOrderDto) {
    const newOrder = this.repository.create({
      user: { id: dto.userId },
      ...dto,
    });
    await this.repository.save(newOrder);
    return {
      status_code: 201,
      message: 'Order created succsessfuly',
      data: newOrder,
    };
  }

  async findAll(userId: string, options?: IFindOptions<Orders>) {
    const orders = await this.repository.find({
      ...options,
      where: { user: { id: userId } },
    });
    return {
      status_code: 200,
      message: 'Orders fetched succsessfuly',
      data: orders,
    };
  }

  async findOne(id: string) {
    const order = await this.repository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return {
      status_code: 200,
      message: 'Order fetched succsessfuly',
      data: order,
    };
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Order updated succsessfuly',
      data: (await this.findOne(id)).data,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Order deleted succsessfuly',
      data: {},
    };
  }
}
