import { IsString, IsNumber, Matches, Max, Min } from 'class-validator';

export class VerifyNumberDto {
  @IsString()
  @Matches(/^7\d{10}$/, {
    message:
      'Kazakhstan phone number must start with 7 and contain 11 digits total',
  })
  phone_number: string;

  @IsNumber()
  @Max(6)
  @Min(6)
  verification_code: number;
}
