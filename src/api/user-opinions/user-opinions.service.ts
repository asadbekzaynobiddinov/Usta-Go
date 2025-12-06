import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PictureOpinionsRepository,
  PicturesOfOpinions,
  UserOpinions,
  UserOpinionsRepository,
} from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class UserOpinionsService {
  constructor(
    @InjectRepository(UserOpinions)
    private readonly repository: UserOpinionsRepository,
    @InjectRepository(PicturesOfOpinions)
    private readonly picturesRepository: PictureOpinionsRepository,
  ) {}
  async create(dto: CreateUserOpinionDto) {
    const newOpinion = this.repository.create({
      user: { id: dto.user_id },
      master: { id: dto.master_id },
      order: { id: dto.order_id },
      comment: dto.coment,
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

    return {
      status_code: 201,
      message: 'User opinion created succsessfuly',
      data: newOpinion,
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

  async update(id: string, dto: UpdateUserOpinionDto, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.update({ id }, {});
    return {
      status_code: 200,
      message: 'User opinion updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'User opinion deleted succsessfuly',
      data: {},
    };
  }
}
