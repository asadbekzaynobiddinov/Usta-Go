import { IsString, IsEnum, Matches } from 'class-validator';
import { UserLang } from 'src/common/enum';

export class RegisterDto {
  @IsString()
  @Matches(/^7\d{10}$/, {
    message:
      'Kazakhstan phone number must start with 7 and contain 11 digits total',
  })
  phone_number: string;

  @IsString()
  password: string;

  @IsEnum(UserLang)
  language: UserLang;
}
