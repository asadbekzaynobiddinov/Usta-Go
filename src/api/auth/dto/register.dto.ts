import { IsString, IsEmail, IsEnum } from 'class-validator';
import { RoleUser } from 'src/common/enum';

export class RegisterDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(RoleUser, { message: 'role must be "user" or "master"' })
  role: RoleUser;
}
