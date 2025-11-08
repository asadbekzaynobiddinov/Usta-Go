import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { OrderOffersService } from './order-offers.service';
import { OrderOffersController } from './order-offers.controller';
import { OrderOffers } from 'src/core';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderOffers]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [OrderOffersController],
  providers: [OrderOffersService],
})
export class OrderOffersModule {}
