import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Admin } from 'src/core';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [AdminController],
  providers: [AdminService, BcryptEncryption],
})
export class AdminModule {}
