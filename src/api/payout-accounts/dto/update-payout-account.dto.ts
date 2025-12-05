import {
  IsString,
  IsOptional,
  IsIBAN,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PayoutAccountsEnum } from 'src/common/enum';

export class UpdatePayoutAccountDto {
  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsIBAN()
  iban?: string;

  @IsOptional()
  @IsString()
  holder_name?: string;

  @IsOptional()
  @IsEnum(PayoutAccountsEnum, { message: 'Invalid status value' })
  status?: PayoutAccountsEnum;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
