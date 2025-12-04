import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messages.controller';
import { Messages } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Messages]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
