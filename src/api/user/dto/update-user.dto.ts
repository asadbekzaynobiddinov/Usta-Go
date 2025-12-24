import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserAccountStatus, UserLang } from 'src/common/enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(UserLang)
  language?: UserLang;

  @IsOptional()
  @IsEnum(UserAccountStatus)
  account_status?: UserAccountStatus;
}
