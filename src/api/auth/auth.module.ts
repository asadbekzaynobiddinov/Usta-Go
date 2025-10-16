import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './mail.service';
import { User } from 'src/core/entity/user.entity';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
    JwtModule.register({ secret: config.ACCESS_TOKEN_KEY }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, BcryptEncryption],
})
export class AuthModule {}
