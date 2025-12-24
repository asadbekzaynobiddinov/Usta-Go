import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('verify-number')
  verifyNumber(@Body() body: VerifyNumberDto) {
    return this.authService.verifyNumber(body);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: ResendOtpDto) {
    return this.authService.resendOtp(body);
  }

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth() {}

  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req: { user: IGoogleProfile }) {
  //   return this.authService.googleAuth(req.user);
  // }
}
