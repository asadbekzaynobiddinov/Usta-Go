/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOpinion = this.repository.create({
        user: { id: dto.user_id },
        master: { id: dto.master_id },
        order: { id: dto.order_id },
        rating: dto.rating,
        comment: dto.coment,
      });

      const savedOpinion = await queryRunner.manager.save(newOpinion);

      if (dto.pictures && dto.pictures.length > 0) {
        const pictureEntities = dto.pictures.map((url) =>
          this.picturesRepository.create({
            opinion: { id: savedOpinion.id },
            picture_url: url,
          }),
        );

        await queryRunner.manager.save(pictureEntities);

        savedOpinion.pictures = pictureEntities;
      }

      await queryRunner.commitTransaction();

      return {
        status_code: 201,
        message: 'User opinion created successfully',
        data: savedOpinion,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException(
        'Could not create user opinion',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
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
    const data = (await this.findOne({ where: { id } })).data;
    if (data.user.id !== userId) {
      throw new UnauthorizedException(
        `You don't have access to update this opinion`,
      );
    }
    await this.repository.update({ id }, {});
    return {
      status_code: 200,
      message: 'User opinion updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    const data = (await this.findOne({ where: { id } })).data;
    if (data.user.id !== userId) {
      throw new UnauthorizedException(
        `You don't have access to delete this opinion`,
      );
    }
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'User opinion deleted succsessfuly',
      data: {},
    };
  }
}
