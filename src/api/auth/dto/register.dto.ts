import { IsString, IsEnum } from 'class-validator';
import { UserLang } from 'src/common/enum';

export class RegisterDto {
  @IsString()
  phone_number: string;

  @IsString()
  password: string;

  @IsEnum(UserLang)
  language: UserLang;
}
