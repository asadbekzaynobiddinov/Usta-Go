import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify')
  verify(@Body() user: { email: string; otp: number }) {
    return this.authService.verify(user.email, user.otp);
  }

  @Post('login')
  login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user.email, user.password);
  }
}
