import { Module } from '@nestjs/common';
import { PayoutAccountsService } from './payout-accounts.service';
import { PayoutAccountsController } from './payout-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutAccounts } from 'src/core';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayoutAccounts]),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
  ],
  controllers: [PayoutAccountsController],
  providers: [PayoutAccountsService],
})
export class PayoutAccountsModule {}
