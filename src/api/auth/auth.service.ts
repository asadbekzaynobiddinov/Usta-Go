import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { User, UserRepository } from 'src/core';
import { MailService } from './mail.service';
// import { generateOTP } from 'src/infrastructure/lib/otp-generator/generateOTP';
// import { BcryptEncryption } from 'src/infrastructure/lib/bcrypt';
// import { IPayload } from 'src/infrastructure/lib/prompts/types';
import { JwtService } from '@nestjs/jwt';
import { IGoogleProfile, IPayload } from 'src/common/interface';
import { config } from 'src/config';
import { UserAccountStatus } from 'src/common/enum';
import { generateOTP } from 'src/infrastructure/lib/otp-generator/generateOTP';
import smsService from '../sms/sms.service';
import { VerificationCodes } from 'src/core/entity/verificationcodes.entity';
import { VerificationCodesRepository } from 'src/core/repository/verification-codes.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly mail: MailService,
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(VerificationCodes)
    private readonly codeRepository: VerificationCodesRepository,
    private jwt: JwtService,
  ) {}
  // async register(dto: RegisterDto) {
  //   const userExists = await this.userRepository.findOne({
  //     where: { email: dto.email },
  //   });

  //   if (userExists) {
  //     return {
  //       status_code: 409,
  //       message: 'This email already taken',
  //       data: {},
  //     };
  //   }

  //   const newUser = this.userRepository.create({
  //     ...dto,
  //     password: await BcryptEncryption.encrypt(dto.password),
  //   });

  //   const otpPassword = String(generateOTP());

  //   await this.cache.set(`confirmation-${newUser.email}`, otpPassword);

  //   const html = `
  //     <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
  //       <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
  //         <h2 style="color:#007a3d;text-align:center;">UstaGo</h2>
  //         <p style="font-size:16px;">Assalomu alaykum 👋 ${newUser.email}</p>
  //         <p>Sizning Tasdiqlash kodingiz: <code><b style="color:#ff5722;">${otpPassword}</b></code></p>
  //         <p style="font-size:14px;color:#777;">Kod 5 daqiqa amal qiladi</p>
  //       </div>
  //     </div>
  //   `;

  //   await this.mail.sendHtmlMail(newUser.email, 'Otp password', html);

  //   await this.userRepository.save(newUser);

  //   return {
  //     status_code: 201,
  //     message: `User created succsessfuly and sended OTP password to ${newUser.email}`,
  //     data: {},
  //   };
  // }

  // async verify(email: string, otp: number) {
  //   const otpCode: undefined | number = await this.cache.get(
  //     `confirmation-${email}`,
  //   );
  //   console.log({ otpCode, otp });
  //   if (otpCode === undefined) {
  //     return {
  //       status_code: 404,
  //       message: 'Otp code not found',
  //       data: {},
  //     };
  //   }
  //   if (otp != otpCode) {
  //     return {
  //       status_code: 400,
  //       message: "Otp code didn't match",
  //       data: {},
  //     };
  //   }
  //   await this.userRepository.update({ email }, { is_vertfied: true });
  //   await this.cache.del(`confirmation-${email}`);
  //   return {
  //     status_code: 200,
  //     message: 'User verified successfuly',
  //     data: {},
  //   };
  // }

  // async login(email: string, pass: string) {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) {
  //     return {
  //       status_code: 404,
  //       message: 'User not found',
  //       data: {},
  //     };
  //   }
  //   const passwordsSame = await BcryptEncryption.compare(pass, user.password);
  //   if (!passwordsSame) {
  //     return {
  //       status_code: 401,
  //       message: "Passwords didn't match",
  //       data: {},
  //     };
  //   }
  //   if (!user.is_vertfied) {
  //     return {
  //       status_code: 403,
  //       message: 'User not verified',
  //       data: {},
  //     };
  //   }
  //   const payload: IPayload = {
  //     sub: user.id,
  //     email: user.email,
  //     role: user.role,
  //   };

  //   const token = this.jwt.sign(payload, {
  //     secret: config.ACCESS_TOKEN_KEY,
  //     expiresIn: '30d',
  //   });

  //   const { password, ...data } = user;

  //   return {
  //     status_code: 200,
  //     message: 'Successful login',
  //     data: {
  //       token,
  //       user: {
  //         ...data,
  //       },
  //     },
  //   };
  // }

  async googleAuth(googleProfile: IGoogleProfile) {
    const user = await this.userRepository.findOne({
      where: { email: googleProfile.emails[0].value },
      relations: ['master_profile'],
    });
    if (!user) {
      try {
        const newUser = this.userRepository.create({
          email: googleProfile.emails[0].value,
          first_name: googleProfile.name.givenName,
          last_name: googleProfile.name.familyName,
          avatar_url: googleProfile.photos[0]?.value,
          account_status: UserAccountStatus.NOT_FILLED,
        });
        await this.userRepository.save(newUser);
        const payload: IPayload = {
          sub: newUser.id,
          role: 'user',
          userStatus: newUser.account_status,
        };
        const token = this.jwt.sign(payload, {
          secret: config.ACCESS_TOKEN_KEY,
          expiresIn: '30d',
        });
        return {
          status_code: 201,
          message: 'User created via Google Auth',
          data: {
            token,
            user: {
              ...newUser,
            },
          },
        };
      } catch (error) {
        console.error('Error creating user via Google Auth:', error);
        return {
          status_code: 400,
          message: 'Error creating user via Google Auth',
          data: {},
        };
      }
    }
    const payload: IPayload = {
      sub: user.id,
      email: user.email,
      role: 'user',
      userStatus: user.account_status,
    };
    const token = this.jwt.sign(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: '30d',
    });
    return {
      status_code: 200,
      message: 'Successful login via Google Auth',
      data: {
        token,
        user: {
          ...user,
        },
      },
    };
  }

  async sendOtp(phone_number: string, userId: string) {
    const otpCode = generateOTP();
    const response = await smsService.sendSms({
      recipient: phone_number,
      text: `Verification code: ${otpCode}`,
      from: '',
    });
    if (response.code !== 0) {
      throw new BadRequestException(response.message);
    }
    const newVerificatinCOde = this.codeRepository.create({
      user: { id: userId },
      code: otpCode,
      valid_until: new Date(Date.now() + 5 * 60 * 1000),
    });
    await this.codeRepository.save(newVerificatinCOde);
    return {
      status_code: 200,
      messgae: `Otp code sent to ${phone_number}`,
      data: newVerificatinCOde,
    };
  }

  async verifyNumber(code: number, userId: string) {
    const otpCode = await this.codeRepository.findOne({
      where: { code, user: { id: userId } },
    });
    if (!otpCode) {
      throw new NotFoundException('Verification code not found');
    }
    console.log(otpCode);
  }
}
