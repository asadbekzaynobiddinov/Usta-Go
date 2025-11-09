import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserOpinionsService } from './user-opinions.service';
import { UserOpinionsController } from './user-opinions.controller';
import { UserOpinions } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOpinions]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [UserOpinionsController],
  providers: [UserOpinionsService],
})
export class UserOpinionsModule {}
