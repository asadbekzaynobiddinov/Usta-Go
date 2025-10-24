import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from 'src/core';
import { config } from 'src/config';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [AdminController],
  providers: [AdminService, BcryptEncryption],
})
export class AdminModule {}
