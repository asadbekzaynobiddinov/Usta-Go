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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, BcryptEncryption, GoogleStrategy],
})
export class AuthModule {}
