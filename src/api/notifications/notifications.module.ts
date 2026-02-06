import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notifications } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notifications]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
