/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Admin, AdminRepository } from 'src/core';
import { AdminLoginDto } from './dto/admin-login.dto';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { IPayload } from 'src/common/interface';
import { config } from 'src/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly repository: AdminRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.repository.findOne({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Email or password incorrect');
    }

    const passwordsMatch = await BcryptEncryption.compare(
      dto.password,
      admin.password,
    );

    if (!passwordsMatch) {
      throw new UnauthorizedException('Email or password incorrect');
    }

    const payload: IPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwt.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '30d',
    });

    return {
      status_code: 200,
      message: 'Logged in successfully',
      data: { token },
    };
  }
}
