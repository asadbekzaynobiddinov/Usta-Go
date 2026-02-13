import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { AuthModule } from './auth/auth.module';
import { MasterProfileModule } from './master-profile/master-profile.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { MasterServicesModule } from './master-services/master-services.module';
import { PayoutAccountsModule } from './payout-accounts/payout-accounts.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { OrdersModule } from './orders/orders.module';
import { OrderOffersModule } from './order-offers/order-offers.module';
import { UserOpinionsModule } from './user-opinions/user-opinions.module';
import { MessageAttachmentsModule } from './message-attachments/message-attachments.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NotificationsModule } from './notifications/notifications.module';

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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 50,
        },
      ],
    }),
    AdminModule,
    AuthModule,
    UserModule,
    MasterProfileModule,
    MasterServicesModule,
    PayoutAccountsModule,
    PaymentMethodsModule,
    OrdersModule,
    OrderOffersModule,
    UserOpinionsModule,
    ChatModule,
    MessagesModule,
    MessageAttachmentsModule,
    UploadModule,
    NotificationsModule,
    WebSocketModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
