import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import { MasterProfile, MasterProfileRepository } from 'src/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterStatus, OrderStatus } from 'src/common/enum';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';
import { QueryDto } from 'src/common/dto';

@Injectable()
export class MasterProfileService {
  constructor(
    @InjectRepository(MasterProfile)
    private readonly repository: MasterProfileRepository,
  ) {}
  async create(dto: CreateMasterProfileDto) {
    const profileExists = await this.repository.findOne({
      where: { user: { id: dto.user_id } },
      relations: ['user'],
    });

    if (profileExists) {
      throw new ConflictException('Profile already exists');
    }

    const newProfile = this.repository.create({
      user: { id: dto.user_id },
      occupations: [...dto.occupations],
      first_name: dto.first_name,
      last_name: dto.last_name,
      gender: dto.gender,
      passport_image_url: dto.passport_image_url,
      selfie_image_url: dto.selfie_image_url,
      status: MasterStatus.PENDING,
    });

    await this.repository.save(newProfile);

    return {
      status_code: 201,
      message: 'Master profile created successfully',
      data: newProfile,
    };
  }

  async findAll(query: QueryDto) {
    const skip = (query.page - 1) * query.limit;

    try {
      const profiles = await this.repository
        .createQueryBuilder('master')
        .loadRelationCountAndMap(
          'master.completedOrdersCount',
          'master.orders',
          'orders',
          (qb) =>
            qb.where('orders.status = :status', {
              status: OrderStatus.COMPLETED,
            }),
        )
        .loadRelationCountAndMap(
          'master.userOpinionsCount',
          'master.user_opinions',
          'opinions',
        )
        .where('master.status = :status', { status: MasterStatus.VERIFIED })
        .leftJoinAndSelect('master.services', 'services')
        .leftJoinAndSelect('services.pictures', 'service_pictures')
        .orderBy(`master.${query.orderBy}`, `${query.order}`)
        .skip(skip)
        .take(query.limit)
        .getMany();

      return {
        status_code: 200,
        message: 'Master profiles fetched successfully',
        data: profiles,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string) {
    const profile = await this.repository
      .createQueryBuilder('master')
      .select([
        'master.id',
        'master.first_name',
        'master.last_name',
        'master.gender',
        'master.bio',
        'master.occupations',
        'master.experience',
        'master.rating_sum',
        'master.rating_count',
        'master.address',
      ])
      .leftJoin('master.user', 'user')
      .addSelect(['user.first_name', 'user.last_name'])
      .leftJoinAndSelect('master.services', 'services')
      .leftJoinAndSelect('services.pictures', 'service_pictures')
      .leftJoinAndSelect(
        'master.orders',
        'orders',
        'orders.status = :orderStatus',
        {
          orderStatus: OrderStatus.COMPLETED,
        },
      )
      .leftJoinAndSelect('orders.pictures', 'order_pictures_pictures')
      .leftJoinAndSelect('master.user_opinions', 'user_opinions')
      .leftJoinAndSelect('user_opinions.pictures', 'user_opinion_pictures')
      .where('master.id = :id', { id })
      .andWhere('master.status = :status', { status: MasterStatus.VERIFIED })
      .getOne();

    if (!profile) {
      throw new NotFoundException('Master profile not found');
    }

    return {
      status_code: 200,
      message: 'Master profile fetched successfully',
      data: profile,
    };
  }

  async getMe(id: string) {
    const profile = await this.repository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return {
      status_code: 200,
      message: 'Master profile fetched successfuly',
      data: profile,
    };
  }

  async update(id: string, dto: UpdateMasterProfileDto) {
    await this.findOne(id);
    await this.repository.update({ id }, { ...dto });
    return {
      status_codecode: 200,
      message: 'Profile updated successfuly',
      data: await this.repository.findOneBy({ id }),
    };
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Profile deleted successfuly',
      data: {},
    };
  }

  async verify(id: string) {
    const master = await this.repository.findOne({ where: { id } });

    if (!master) {
      throw new NotFoundException('Master profile not found');
    }

    master.status = MasterStatus.VERIFIED;
    await this.repository.save(master);

    return {
      status_code: 200,
      message: 'Master profile verified successfuly',
      data: {},
    };
  }
}
