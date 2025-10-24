import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { IGoogleProfile } from 'src/infrastructure/lib/prompts/types';

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
}
