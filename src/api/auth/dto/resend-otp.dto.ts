import { IsString, Matches } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  @Matches(/^7\d{10}$/, {
    message:
      'Kazakhstan phone number must start with 7 and contain 11 digits total',
  })
  phone_number: string;
}
