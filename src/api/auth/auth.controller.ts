import { Controller, Body, Post, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PhoneNumberDto } from './dto/phone-number.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @HttpCode(200)
  @Post('logout')
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refresh_token);
  }

  @HttpCode(200)
  @Post('verify-number')
  verifyNumber(@Body() body: VerifyNumberDto) {
    return this.authService.verifyNumber(body);
  }

  @HttpCode(200)
  @Post('resend-otp')
  resendOtp(@Body() body: PhoneNumberDto) {
    return this.authService.resendOtp(body);
  }

  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
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
