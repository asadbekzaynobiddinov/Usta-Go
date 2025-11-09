import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserOpinions, UserOpinionsRepository } from 'src/core';

@Injectable()
export class UserOpinionsService {
  constructor(
    @InjectRepository(UserOpinions)
    private readonly repository: UserOpinionsRepository,
  ) {}
  async create(dto: CreateUserOpinionDto) {
    const newOpinion = this.repository.create({
      user: { id: dto.userId },
      master: { id: dto.masterId },
      order: { id: dto.orderId },
      ...dto,
      pictures: [],
    });
    await this.repository.save(newOpinion);
    return {
      status_code: 201,
      message: 'User opinion created succsessfuly',
      data: newOpinion,
    };
  }

  async findAll() {
    const opinions = await this.repository.find();
    return {
      status_code: 200,
      message: 'User opinions fetched succsessfuly',
      data: opinions,
    };
  }

  async findOne(id: string) {
    const opinion = await this.repository.findOneBy({ id });
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
    await this.findOne(id);
    await this.repository.update({ id }, {});
    console.log(dto);
    return {
      status_code: 200,
      message: 'User opinion updated succsessfuly',
      data: (await this.findOne(id)).data,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'User opinion deleted succsessfuly',
      data: {},
    };
  }
}
