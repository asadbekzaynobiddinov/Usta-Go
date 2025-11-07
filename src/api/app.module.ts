import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { config } from 'src/config';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MasterProfileModule } from './master-profile/master-profile.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { MasterServicesModule } from './master-services/master-services.module';
import { PayoutAccountsModule } from './payout-accounts/payout-accounts.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: true,
      entities: ['dist/core/entity/*.entity{.ts,.js}'],
    }),
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
    CacheModule.register({
      ttl: 60,
    }),
    AdminModule,
    AuthModule,
    UserModule,
    MasterProfileModule,
    MasterServicesModule,
    PayoutAccountsModule,
    PaymentMethodsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
