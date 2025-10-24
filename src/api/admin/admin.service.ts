/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BaseService } from 'src/infrastructure/lib/baseService';
import { Admin, AdminRepository } from 'src/core';
import { AdminLoginDto } from './dto/admin-logn.dto';
import { IPayload } from 'src/infrastructure/lib/prompts/types';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { RoleAdmin } from 'src/common/enum';
import { config } from 'src/config';

@Injectable()
export class AdminService extends BaseService<
  CreateAdminDto,
  DeepPartial<Admin>
> {
  constructor(
    @InjectRepository(Admin) repository: AdminRepository,
    private jwtService: JwtService,
  ) {
    super(repository);
  }

  async create(dto: CreateAdminDto): Promise<{
    status_code: number;
    message: string;
    data: DeepPartial<Admin>;
  }> {
    const adminExists = await this.getRepository.findOne({
      where: { email: dto.email },
    });
    if (adminExists) {
      return {
        status_code: 409,
        message: 'This email already taken',
        data: {},
      };
    }
    const newAdmin = this.getRepository.create({
      ...dto,
      password: await BcryptEncryption.encrypt(dto.password),
    });
    await this.getRepository.save(newAdmin);
    return {
      status_code: 201,
      message: 'Admin created successfully',
      data: newAdmin,
    };
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.getRepository.findOne({
      where: { email: dto.email },
    });
    if (!admin) {
      return { status_code: 404, message: 'Admin not found', data: {} };
    }
    const passwordMatch = await BcryptEncryption.compare(
      dto.password,
      admin.password,
    );
    if (!passwordMatch) {
      return { status_code: 401, message: 'Invalid credentials', data: {} };
    }
    const payload: IPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role as RoleAdmin,
    };
    const token = this.jwtService.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '3d',
    });
    return {
      status_code: 200,
      message: 'Login successful',
      data: {
        token,
      },
    };
  }
}
