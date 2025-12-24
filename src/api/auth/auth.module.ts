import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './mail.service';
import { User } from 'src/core/entity/user.entity';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { VerificationCodes } from 'src/core/entity/verificationcodes.entity';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '8089508975:AAGmANDi55K63ELxGOk1yMKoPW7Nt9YRiyc',
    }),
    PassportModule.register({ defaultStrategy: 'google' }),
    TypeOrmModule.forFeature([User, VerificationCodes]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, BcryptEncryption, GoogleStrategy],
})
export class AuthModule {}
