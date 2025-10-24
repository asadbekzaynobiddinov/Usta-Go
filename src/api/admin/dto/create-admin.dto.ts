import { IsString, IsEmail, IsEnum } from 'class-validator';
import { RoleAdmin } from 'src/common/enum';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(RoleAdmin, { message: 'role must be "admin" or "superadmin"' })
  role: RoleAdmin;
}
