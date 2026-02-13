/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RefreshToken,
  RefreshTokenRepository,
  User,
  UserRepository,
} from 'src/core';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';
import {
  MasterStatus,
  RoleUser,
  TokenType,
  UserAccountStatus,
} from 'src/common/enum';
import { generateOTP } from 'src/infrastructure/lib/otp-generator/generateOTP';
import { RegisterDto } from './dto/register.dto';
import { VerificationCodes } from 'src/core/entity/verificationcodes.entity';
import { VerificationCodesRepository } from 'src/core/repository/verification-codes.repository';
// import mobizon from 'src/infrastructure/lib/sms-service';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { IPayload } from 'src/common/interface';
import { LoginDto } from './dto/login.dto';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { PhoneNumberDto } from './dto/phone-number.dto';
import { Not } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(VerificationCodes)
    private readonly codeRepository: VerificationCodesRepository,
    private jwt: JwtService,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: RefreshTokenRepository,
  ) {}
  async register(dto: RegisterDto) {
    let user = await this.userRepository.findOne({
      where: { phone_number: dto.phone_number },
    });

    if (user && user.account_status === UserAccountStatus.VERIFIED) {
      throw new BadRequestException('Phone number already in use');
    }

    // Agar user mavjud bo‘lsa, OTP tekshiramiz
    if (user) {
      const existingCode = await this.codeRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (existingCode && existingCode.valid_until > new Date()) {
        throw new BadRequestException(
          'Verification code is still valid. Please wait before requesting a new one.',
        );
      }
    }

    // Agar user yo‘q bo‘lsa yaratamiz
    if (!user) {
      const hashedPassword = await BcryptEncryption.encrypt(dto.password);

      user = this.userRepository.create({
        phone_number: dto.phone_number,
        password: hashedPassword,
        language: dto.language,
      });

      await this.userRepository.save(user);
    }

    // Eski kodlarni o‘chiramiz
    await this.codeRepository.delete({ user: { id: user.id } });

    const otpPassword = String(generateOTP());

    const newVerificationCode = this.codeRepository.create({
      user: { id: user.id },
      code: Number(otpPassword),
      valid_until: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.codeRepository.save(newVerificationCode);

    return {
      status_code: 201,
      message: `OTP sent to ${user.phone_number}`,
      data: {
        verificationCode: newVerificationCode,
      },
    };
  }

  async verifyNumber(dto: VerifyNumberDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phone_number', {
        phone_number: dto.phone_number,
      })
      .andWhere('user.account_status != :status', {
        status: UserAccountStatus.VERIFIED,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found or already verified');
    }

    const otpCode = await this.codeRepository.findOne({
      where: {
        code: dto.verification_code,
        user: { phone_number: user.phone_number },
      },
    });

    if (!otpCode) {
      throw new NotFoundException('Verification code not found');
    }
    if (otpCode.valid_until < new Date(Date.now())) {
      throw new BadRequestException('Verification code expired');
    }

    user.account_status = UserAccountStatus.VERIFIED;
    await this.userRepository.save(user);

    await this.codeRepository.delete({ id: otpCode.id });

    const payload: IPayload = {
      sub: user.id,
      role: RoleUser.USER,
    };

    const access_token = this.jwt.sign(
      { ...payload, token_type: TokenType.ACCESS },
      {
        secret: config.ACCESS_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    const refresh_token = this.jwt.sign(
      { ...payload, token_type: TokenType.REFRESH },
      {
        secret: config.REFRESH_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    const newRefreshToken = this.tokenRepository.create({
      owner_id: user.id,
      token: (await BcryptEncryption.encrypt(refresh_token)) as string,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await this.tokenRepository.save(newRefreshToken);

    const { password, ...userData } = user;

    return {
      status_code: 200,
      message: 'Phone number verified successfully',
      data: {
        access_token,
        refresh_token,
        user: userData,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phone_number: dto.phone_number },
      relations: ['master_profile'],
    });

    if (!user) {
      throw new BadRequestException('Invalid phone number or password');
    }

    const passwordsMatch = (await BcryptEncryption.compare(
      dto.password,
      user.password,
    )) as boolean;

    if (!passwordsMatch) {
      throw new BadRequestException('Invalid phone number or password');
    }

    if (user.account_status !== UserAccountStatus.VERIFIED) {
      throw new BadRequestException('User phone number is not verified');
    }

    let master_access_token: string | null = null;
    let master_refresh_token: string | null = null;

    if (
      user.master_profile &&
      user.master_profile.status === MasterStatus.VERIFIED
    ) {
      const masterPayload: IPayload = {
        sub: user.master_profile.id,
        role: RoleUser.MASTER,
      };

      master_access_token = this.jwt.sign(
        { ...masterPayload, token_type: TokenType.ACCESS },
        {
          secret: config.ACCESS_TOKEN_KEY,
          expiresIn: '30d',
        },
      );

      master_refresh_token = this.jwt.sign(
        { ...masterPayload, token_type: TokenType.REFRESH },
        {
          secret: config.REFRESH_TOKEN_KEY,
          expiresIn: '30d',
        },
      );

      const existingToken = await this.tokenRepository.findOne({
        where: {
          owner_id: user.master_profile.id,
        },
      });

      if (existingToken) {
        await this.tokenRepository.update(existingToken.id, {
          token: crypto.hash('sha256', master_refresh_token),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      } else {
        await this.tokenRepository.save(
          this.tokenRepository.create({
            owner_id: user.master_profile.id,
            token: crypto.hash('sha256', master_refresh_token),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        );
      }
    }

    const userPayload: IPayload = {
      sub: user.id,
      role: RoleUser.USER,
    };

    const user_access_token = this.jwt.sign(
      { ...userPayload, token_type: TokenType.ACCESS },
      {
        secret: config.ACCESS_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    const user_refresh_token = this.jwt.sign(
      { ...userPayload, token_type: TokenType.REFRESH },
      {
        secret: config.REFRESH_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    const existingToken = await this.tokenRepository.findOne({
      where: {
        owner_id: user.id,
      },
    });

    if (existingToken) {
      await this.tokenRepository.update(existingToken.id, {
        token: crypto.hash('sha256', user_refresh_token),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } else {
      await this.tokenRepository.save(
        this.tokenRepository.create({
          owner_id: user.id,
          token: crypto.hash('sha256', user_refresh_token),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
      );
    }

    const { password, ...userData } = user;

    return {
      status_code: 200,
      message: 'Login successful',
      data: {
        tokens: {
          user: {
            access_token: user_access_token,
            refresh_token: user_refresh_token,
          },
          master: master_access_token
            ? {
                access_token: master_access_token,
                refresh_token: master_refresh_token,
              }
            : null,
        },
        user: userData,
      },
    };
  }

  async logout(token: string) {
    const decoded: IPayload = this.jwt.decode(token);

    if (!decoded || decoded.token_type !== TokenType.REFRESH) {
      throw new BadRequestException('Invalid refresh token');
    }

    const verified: IPayload = this.jwt.verify(token, {
      secret: config.REFRESH_TOKEN_KEY,
    });

    if (!verified) {
      throw new BadRequestException('Invalid refresh token');
    }

    const existingToken = await this.tokenRepository.findOne({
      where: {
        owner_id: verified.sub,
      },
    });

    if (!existingToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const tokensMatch = existingToken.token === crypto.hash('sha256', token);

    if (!tokensMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.tokenRepository.delete({ id: existingToken.id });

    return {
      status_code: 200,
      message: 'Logout successful',
      data: {},
    };
  }

  async resendOtp(dto: PhoneNumberDto) {
    const user = await this.userRepository.findOne({
      where: {
        phone_number: dto.phone_number,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account_status === UserAccountStatus.VERIFIED) {
      throw new BadRequestException('User already verified');
    }

    const otpPassword = String(generateOTP());
    const newVerificationCode = this.codeRepository.create({
      user: { id: user.id },
      code: Number(otpPassword),
      valid_until: new Date(Date.now() + 5 * 60 * 1000),
    });
    await this.codeRepository.save(newVerificationCode);

    // const response = await mobizon.sendSms({
    //   recipient: dto.phone_number,
    //   text: `Your OTP code is: ${otpPassword}`,
    //   from: '',
    // });

    // if (response.code !== 0) {
    //   throw new BadRequestException(
    //     'Failed to resend OTP code. Please try again later.',
    //   );
    // }

    return {
      status_code: 200,
      message: `OTP password resent to ${dto.phone_number}`,
      data: { newVerificationCode },
    };
  }

  async refreshToken(token: string) {
    const decoded: IPayload = this.jwt.decode(token);

    if (!decoded || decoded.token_type !== TokenType.REFRESH) {
      throw new BadRequestException('Invalid refresh token');
    }

    const verified: IPayload = this.jwt.verify(token, {
      secret: config.REFRESH_TOKEN_KEY,
    });

    if (!verified) {
      throw new BadRequestException('Invalid refresh token');
    }

    const existingToken = await this.tokenRepository.findOne({
      where: {
        owner_id: verified.sub,
      },
    });

    if (!existingToken) {
      throw new BadRequestException('Refresh token not found');
    }

    if (existingToken.expires_at < new Date(Date.now())) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const tokensMatch = existingToken.token === crypto.hash('sha256', token);

    if (!tokensMatch) {
      throw new BadRequestException('Invalid refresh token');
    }

    const payload: IPayload = {
      sub: verified.sub,
      role: verified.role,
    };

    const access_token = this.jwt.sign(
      { ...payload, token_type: TokenType.ACCESS },
      {
        secret: config.ACCESS_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    const refresh_token = this.jwt.sign(
      { ...payload, token_type: TokenType.REFRESH },
      {
        secret: config.REFRESH_TOKEN_KEY,
        expiresIn: '30d',
      },
    );

    existingToken.token = crypto.hash('sha256', refresh_token);
    existingToken.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.tokenRepository.save(existingToken);

    return {
      status_code: 200,
      message: 'Token refreshed successfully',
      data: {
        refresh_token,
        access_token,
      },
    };
  }

  // async googleAuth(googleProfile: IGoogleProfile) {
  //   const user = await this.userRepository.findOne({
  //     where: { email: googleProfile.emails[0].value },
  //     relations: ['master_profile'],
  //   });
  //   if (!user) {
  //     try {
  //       const newUser = this.userRepository.create({
  //         email: googleProfile.emails[0].value,
  //         first_name: googleProfile.name.givenName,
  //         last_name: googleProfile.name.familyName,
  //         avatar_url: googleProfile.photos[0]?.value,
  //         account_status: UserAccountStatus.NOT_FILLED,
  //       });
  //       await this.userRepository.save(newUser);
  //       const payload: IPayload = {
  //         sub: newUser.id,
  //         role: 'user',
  //         userStatus: newUser.account_status,
  //       };
  //       const token = this.jwt.sign(payload, {
  //         secret: config.ACCESS_TOKEN_KEY,
  //         expiresIn: '30d',
  //       });
  //       return {
  //         status_code: 201,
  //         message: 'User created via Google Auth',
  //         data: {
  //           token,
  //           user: {
  //             ...newUser,
  //           },
  //         },
  //       };
  //     } catch (error) {
  //       console.error('Error creating user via Google Auth:', error);
  //       return {
  //         status_code: 400,
  //         message: 'Error creating user via Google Auth',
  //         data: {},
  //       };
  //     }
  //   }
  //   const payload: IPayload = {
  //     sub: user.id,
  //     email: user.email,
  //     role: 'user',
  //     userStatus: user.account_status,
  //   };
  //   const token = this.jwt.sign(payload, {
  //     secret: config.ACCESS_TOKEN_KEY,
  //     expiresIn: '30d',
  //   });
  //   return {
  //     status_code: 200,
  //     message: 'Successful login via Google Auth',
  //     data: {
  //       token,
  //       user: {
  //         ...user,
  //       },
  //     },
  //   };
  // }
}
