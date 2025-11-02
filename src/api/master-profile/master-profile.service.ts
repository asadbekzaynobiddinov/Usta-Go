/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import { MasterProfile, MasterProfileRepository } from 'src/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterStatus } from 'src/common/enum';
import { IFindOptions } from 'src/common/interface';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';

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

    try {
      const newProfile = this.repository.create({
        user: { id: dto.user_id },
        occupation: dto.occupation,
        gender: dto.gender,
        passport_image_url: dto.passport_image_url,
        selfie_image_url: dto.selfie_image_url,
        status: MasterStatus.PENDING,
      });

      await this.repository.save(newProfile);

      return {
        status_code: 201,
        message: 'Profile created successfully',
        data: newProfile,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(options?: IFindOptions<MasterProfile>) {
    try {
      const profiles = await this.repository.find(options);
      return {
        code: 200,
        message: 'Master profiles fetched succsessfuly',
        data: profiles,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneById(id: string) {
    try {
      const profile = await this.repository.findOne({ where: { id } });
      if (!profile) {
        throw new NotFoundException('Master profile not found');
      }
      return {
        code: 200,
        message: 'Master profile fetched succsessfuly',
        data: profile,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, dto: UpdateMasterProfileDto) {
    try {
      await this.repository.update({ id }, { ...dto });
      return {
        code: 200,
        message: 'Profile updated succsessfuly',
        data: await this.repository.findOneBy({ id }),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: string) {
    try {
      await this.repository.delete({ id });
      return {
        code: 204,
        message: 'Profile deleted succsessfuly',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
