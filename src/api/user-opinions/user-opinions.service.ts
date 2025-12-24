import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import {
  Orders,
  PictureOpinionsRepository,
  PicturesOfOpinions,
  UserOpinions,
  UserOpinionsRepository,
  OrdersRepository,
  MasterProfile,
  MasterProfileRepository,
} from 'src/core';

@Injectable()
export class UserOpinionsService {
  constructor(
    @InjectRepository(UserOpinions)
    private readonly repository: UserOpinionsRepository,
    @InjectRepository(PicturesOfOpinions)
    private readonly picturesRepository: PictureOpinionsRepository,
    @InjectRepository(Orders)
    private readonly ordersRepository: OrdersRepository,
    @InjectRepository(MasterProfile)
    private readonly masterRepository: MasterProfileRepository,
  ) {}
  async create(dto: CreateUserOpinionDto) {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.order_id },
      relations: ['master', 'user', 'user_opinion'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (!order.master) {
      throw new BadRequestException('Order has no assigned master');
    }
    if (order.user_opinion) {
      throw new BadRequestException('Opinion for this order already exists');
    }

    const newOpinion = this.repository.create({
      user: { id: order.user.id },
      master: { id: order.master.id },
      order: { id: order.id },
      comment: dto.comment,
      rating: dto.rating,
    });

    await this.repository.save(newOpinion);

    if (dto.pictures?.length) {
      for (const url of dto.pictures) {
        const newPic = this.picturesRepository.create({
          opinion: { id: newOpinion.id },
          picture_url: url,
        });
        await this.picturesRepository.save(newPic);
      }
    }

    await this.masterRepository.update(
      { id: order.master.id },
      {
        rating_sum: () => `rating_sum + ${dto.rating}`,
        rating_count: () => `rating_count + 1`,
      },
    );

    return {
      status_code: 201,
      message: 'User opinion created succsessfuly',
      data: (
        await this.findOne({
          where: { id: newOpinion.id },
          relations: ['pictures'],
        })
      ).data,
    };
  }

  async findAll(options?: FindManyOptions<UserOpinions>) {
    const opinions = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'User opinions fetched succsessfuly',
      data: opinions,
    };
  }

  async findOne(options: FindOneOptions<UserOpinions>) {
    const opinion = await this.repository.findOne(options);
    if (!opinion) {
      throw new NotFoundException('User opinion not found');
    }
    return {
      status_code: 200,
      message: 'User opinion fetched succsessfuly',
      data: opinion,
    };
  }

  async update(id: string, dto: UpdateUserOpinionDto) {
    try {
      const opinion = (
        await this.findOne({ where: { id }, relations: ['master'] })
      ).data;
      const { pictures, rating, ...updateData } = dto;

      await this.repository.update({ id }, { ...updateData, rating });

      await this.masterRepository.update(
        {
          id: opinion.master.id,
        },
        {
          rating_sum: () => `rating_sum - ${opinion.rating} + ${rating}`,
        },
      );

      if (pictures?.length) {
        for (const pic of pictures) {
          await this.picturesRepository.update(
            { id: pic.id },
            { picture_url: pic.picture_url },
          );
        }
      }
      return {
        status_code: 200,
        message: 'User opinion updated succsessfuly',
        data: (await this.findOne({ where: { id }, relations: ['master'] }))
          .data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: string) {
    const opinion = (await this.findOne({ where: { id } })).data;
    await this.masterRepository.update(
      {
        id: opinion.master.id,
      },
      {
        rating_sum: () => `rating_sum - ${opinion.rating}`,
        rating_count: () => `rating_count - 1`,
      },
    );
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'User opinion deleted succsessfuly',
      data: {},
    };
  }
}
