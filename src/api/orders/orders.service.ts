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
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newOrder = this.repository.create({
        user: { id: dto.user_id },
        title: dto.title,
        description: dto.description,
        address: dto.address,
      });

      const savedOrder = await queryRunner.manager.save(newOrder);

      if (dto.pictures && dto.pictures.length > 0) {
        const pictureEntities = dto.pictures.map((url) =>
          this.picturesRepository.create({
            order: { id: savedOrder.id },
            picture_url: url,
          }),
        );

        savedOrder.pictures = pictureEntities;
      }

      await queryRunner.commitTransaction();

      return {
        status_code: 201,
        message: 'Order created succsessfuly',
        data: savedOrder,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not create order');
    } finally {
      await queryRunner.release();
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
    await this.findOne({ where: { id, user: { id: userId } } });

    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        Orders,
        { id },
        {
          ...dto,
        },
      );

      if (dto.pictures && dto.pictures.length > 0) {
        for (const pic of dto.pictures) {
          await queryRunner.manager.update(
            OrderPictures,
            { id: pic.id },
            {
              picture_url: pic.picture_url,
            },
          );
        }
      }

      await queryRunner.commitTransaction();

      return {
        status_code: 200,
        message: 'Order updated succsessfuly',
        data: (await this.findOne({ where: { id }, relations: ['pictures'] }))
          .data,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not update order');
    } finally {
      await queryRunner.release();
    }
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
