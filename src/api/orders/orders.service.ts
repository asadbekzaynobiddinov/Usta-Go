import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrderPictures,
  OrderPicturesRepository,
  Orders,
  OrdersRepository,
} from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private readonly repository: OrdersRepository,
    @InjectRepository(OrderPictures)
    private readonly picturesRepository: OrderPicturesRepository,
  ) {}
  async create(dto: CreateOrderDto) {
    const newOrder = this.repository.create({
      user: { id: dto.user_id },
      title: dto.title,
      description: dto.description,
      address: dto.address,
    });
    try {
      await this.repository.save(newOrder);

      const pictures: OrderPictures[] = [];

      if (dto.pictures?.length) {
        for (const url of dto.pictures) {
          const newPic = this.picturesRepository.create({
            order: { id: newOrder.id },
            picture_url: url,
          });
          await this.picturesRepository.save(newPic);
          pictures.push(newPic);
        }
      }
      return {
        status_code: 201,
        message: 'Order created successfully',
        data: { ...newOrder, pictures },
      };
    } catch (error) {
      console.log(error);
      await this.repository.delete({ id: newOrder.id });
      throw new ConflictException('Could not crete order');
    }
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
    const data = (await this.findOne({ where: { id, user: { id: userId } } }))
      .data;

    const { pictures, master_id, ...updateData } = dto;

    if (master_id) {
      await this.repository.update(
        { id },
        { ...updateData, master: { id: master_id } },
      );
    }

    await this.repository.update({ id }, { ...updateData });

    if (pictures?.length) {
      for (const pic of pictures) {
        if (!pic.id) {
          const newPic = this.picturesRepository.create({
            order: { id: data.id },
            picture_url: pic.picture_url,
          });
          await this.picturesRepository.save(newPic);
          continue;
        }

        const picExists = await this.picturesRepository.exists({
          where: { id: pic.id },
        });

        if (picExists) {
          await this.picturesRepository.update(
            { id: pic.id },
            { picture_url: pic.picture_url },
          );
        }
      }
    }

    return {
      status_code: 200,
      message: 'Order updated succsessfuly',
      data: (await this.findOne({ where: { id }, relations: ['pictures'] }))
        .data,
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
