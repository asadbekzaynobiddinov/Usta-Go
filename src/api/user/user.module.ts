import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Notifications, User } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notifications]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
