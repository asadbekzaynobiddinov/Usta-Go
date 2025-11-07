import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MasterServicesService } from './master-services.service';
import { MasterServicesController } from './master-services.controller';
import { MasterServices } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterServices]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [MasterServicesController],
  providers: [MasterServicesService],
})
export class MasterServicesModule {}
