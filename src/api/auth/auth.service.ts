import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRepository } from 'src/core';
import { JwtService } from '@nestjs/jwt';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { config } from 'src/config';
import { UserAccountStatus } from 'src/common/enum';
import { generateOTP } from 'src/infrastructure/lib/otp-generator/generateOTP';
import { RegisterDto } from './dto/register.dto';
import { VerificationCodes } from 'src/core/entity/verificationcodes.entity';
import { VerificationCodesRepository } from 'src/core/repository/verification-codes.repository';
import mobizon from 'src/infrastructure/lib/sms-service';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { IPayload } from 'src/common/interface';
import { LoginDto } from './dto/login.dto';
import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Not } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(VerificationCodes)
    private readonly codeRepository: VerificationCodesRepository,
    private jwt: JwtService,
    @InjectBot() private bot: Telegraf,
  ) {}
  async register(dto: RegisterDto) {
    const phoneNumberInUse = await this.userRepository.exists({
      where: { phone_number: dto.phone_number },
    });
    if (phoneNumberInUse) {
      throw new BadRequestException('Phone number already in use');
    }

    const hashedPassword = await BcryptEncryption.encrypt(dto.password);

    const newUser = this.userRepository.create({
      phone_number: dto.phone_number,
      password: hashedPassword,
      language: dto.language,
      account_status: UserAccountStatus.FILLED,
    });
    await this.userRepository.save(newUser);

    const otpPassword = String(generateOTP());
    const newVerificationCode = this.codeRepository.create({
      user: { id: newUser.id },
      code: Number(otpPassword),
      valid_until: new Date(Date.now() + 5 * 60 * 1000),
    });
    await this.codeRepository.save(newVerificationCode);

    const response = await mobizon.sendSms({
      recipient: dto.phone_number,
      text: `Your OTP code is: ${otpPassword}`,
      from: '',
    });

    const { password, ...userData } = newUser;

    await this.bot.telegram.sendMessage(
      config.CHANEL_ID,
      `New user registered with phone number: <b>${newUser.phone_number}</b>\nVerification code: <code>${otpPassword}</code>`,
      {
        parse_mode: 'HTML',
      },
    );

    return {
      status_code: 201,
      message: `User registered succsessfuly and sended OTP password to ${newUser.phone_number}`,
      data: userData,
    };
  }

  async verifyNumber(dto: VerifyNumberDto) {
    const otpCode = await this.codeRepository.findOne({
      where: {
        code: dto.verification_code,
        user: { phone_number: dto.phone_number },
      },
    });
    if (!otpCode) {
      throw new NotFoundException('Verification code not found');
    }
    if (otpCode.valid_until < new Date(Date.now())) {
      throw new BadRequestException('Verification code expired');
    }
    const user = await this.userRepository.findOne({
      where: { phone_number: dto.phone_number },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.account_status === UserAccountStatus.VERIFIED) {
      throw new BadRequestException('User already verified');
    }
    user.account_status = UserAccountStatus.VERIFIED;
    await this.userRepository.save(user);
    await this.codeRepository.delete({ id: otpCode.id });
    const payload: IPayload = {
      sub: user.id,
      role: 'user',
      userStatus: user.account_status,
    };
    const token = this.jwt.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '30d',
    });
    const { password, ...userData } = user;
    return {
      status_code: 200,
      message: 'Phone number verified successfully',
      data: {
        token,
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
    const passwordsMatch = await BcryptEncryption.compare(
      dto.password,
      user.password,
    );
    if (!passwordsMatch) {
      throw new BadRequestException('Invalid phone number or password');
    }
    if (user.account_status !== UserAccountStatus.VERIFIED) {
      throw new BadRequestException('User phone number is not verified');
    }
    const payload: IPayload = {
      sub: user.id,
      role: 'user',
      userStatus: user.account_status,
    };
    const token = this.jwt.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '30d',
    });
    const { password, ...userData } = user;
    return {
      status_code: 200,
      message: 'Login successful',
      data: {
        token,
        user: userData,
      },
    };
  }

  async resendOtp(dto: ResendOtpDto) {
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

    const response = await mobizon.sendSms({
      recipient: dto.phone_number,
      text: `Your OTP code is: ${otpPassword}`,
      from: '',
    });

    await this.bot.telegram.sendMessage(
      config.CHANEL_ID,
      `Resent verification code to user with phone number: <b>${user.phone_number}</b>\nNew Verification code: <code>${otpPassword}</code>`,
      {
        parse_mode: 'HTML',
      },
    );

    return {
      status_code: 200,
      message: `OTP password resent to ${dto.phone_number}`,
      data: {},
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
