import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import { MasterProfile, MasterProfileRepository } from 'src/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterStatus } from 'src/common/enum';
import { IPayload } from 'src/common/interface';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class MasterProfileService {
  constructor(
    @InjectRepository(MasterProfile)
    private readonly repository: MasterProfileRepository,
    private readonly jwt: JwtService,
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
      occupation: dto.occupation,
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

  async findAll(options?: FindManyOptions<MasterProfile>) {
    const profiles = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Master profiles fetched succsessfuly',
      data: profiles,
    };
  }

  async findOneById(id: string) {
    const profile = await this.repository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Master profile not found');
    }
    return {
      status_code: 200,
      message: 'Master profile fetched succsessfuly',
      data: profile,
    };
  }

  async update(id: string, dto: UpdateMasterProfileDto) {
    await this.repository.update({ id }, { ...dto });
    return {
      status_codecode: 200,
      message: 'Profile updated succsessfuly',
      data: await this.repository.findOneBy({ id }),
    };
  }

  async delete(id: string) {
    await this.repository.delete({ id });
    return {
      status_code: 204,
      message: 'Profile deleted succsessfuly',
    };
  }

  async getToken(id: string) {
    const masterProfile = await this.repository.findOne({
      where: { user: { id } },
    });
    if (!masterProfile) {
      throw new NotFoundException('Master Profile not found');
    }
    const payload: IPayload = {
      sub: masterProfile.id,
      role: 'master',
    };
    const token = this.jwt.sign(payload, {
      expiresIn: '30d',
    });
    return {
      status_code: 200,
      message: 'Login as master was successful',
      data: { token },
    };
  }
}
