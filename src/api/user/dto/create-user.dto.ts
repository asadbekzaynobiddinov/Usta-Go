import { IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { RoleUser } from 'src/common/enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsEnum(RoleUser, { message: 'role must be "user" or "master"' })
  role: string;

  @IsBoolean()
  is_verified: boolean;
}
