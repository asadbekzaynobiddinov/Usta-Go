import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import {
  MasterProfile,
  MasterProfileRepository,
  RefreshToken,
  RefreshTokenRepository,
} from 'src/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterStatus } from 'src/common/enum';
import { IPayload } from 'src/common/interface';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { config } from 'src/config';

@Injectable()
export class MasterProfileService {
  constructor(
    @InjectRepository(MasterProfile)
    private readonly repository: MasterProfileRepository,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: RefreshTokenRepository,
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

  async findAll(options: FindManyOptions<MasterProfile>) {
    const profiles = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Master profiles fetched succsessfuly',
      data: profiles,
    };
  }

  async findOne(options: FindOneOptions<MasterProfile>) {
    const profile = await this.repository.findOne(options);
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
    await this.findOne({ where: { id } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_codecode: 200,
      message: 'Profile updated succsessfuly',
      data: await this.repository.findOneBy({ id }),
    };
  }

  async delete(id: string) {
    await this.findOne({ where: { id } });
    await this.repository.delete({ id });
    return {
      status_code: 204,
      message: 'Profile deleted succsessfuly',
    };
  }

  async getToken(id: string) {
    const masterProfile = (
      await this.findOne({
        where: { user: { id } },
      })
    ).data;

    if (!masterProfile) {
      throw new NotFoundException('Master Profile not found');
    }

    if (masterProfile.status !== MasterStatus.VERIFIED) {
      throw new ConflictException(
        'Master Profile is not verified. Cannot generate token.',
      );
    }

    const payload: IPayload = {
      sub: masterProfile.id,
      role: 'master',
    };

    const accsess_token = this.jwt.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });

    const refresh_token = this.jwt.sign(payload, {
      secret: config.REFRESH_TOKEN_KEY,
      expiresIn: '30d',
    });

    const newRefreshToken = this.tokenRepository.create({
      owner_id: masterProfile.id,
      token: (await BcryptEncryption.encrypt(refresh_token)) as string,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await this.tokenRepository.save(newRefreshToken);

    return {
      status_code: 200,
      message: 'Login as master successful',
      data: { accsess_token, refresh_token, masterProfile },
    };
  }
}
