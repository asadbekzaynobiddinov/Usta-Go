import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterProfileService } from './master-profile.service';
import { MasterProfileController } from './master-profile.controller';
import { MasterProfile, User } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MasterProfile]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [MasterProfileController],
  providers: [MasterProfileService],
})
export class MasterProfileModule {}
