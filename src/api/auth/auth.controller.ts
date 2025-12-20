import { Controller, Get, Req, UseGuards, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IGoogleProfile } from 'src/common/interface';
import { VerifyNumberDto } from './dto/verify-number.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // register(@Body() dto: RegisterDto) {
  //   return this.authService.register(dto);
  // }

  // @Post('verify')
  // verify(@Body() user: { email: string; otp: number }) {
  //   return this.authService.verify(user.email, user.otp);
  // }

  // @Post('login')
  // login(@Body() user: { email: string; password: string }) {
  //   return this.authService.login(user.email, user.password);
  // }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: { user: IGoogleProfile }) {
    return this.authService.googleAuth(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpDto, @UserID() userId: string) {
    return this.authService.sendOtp(body.phone_number, userId);
  }

  @Post('verify-number')
  verifyNumber(@Body() body: VerifyNumberDto) {
    return this.authService;
  }
}
