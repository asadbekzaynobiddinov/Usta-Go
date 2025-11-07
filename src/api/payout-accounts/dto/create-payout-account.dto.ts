import {
  IsString,
  IsIBAN,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PayoutAccountsEnum } from 'src/common/enum';

export class CreatePayoutAccountDto {
  @IsString()
  bank_name: string;

  @IsString()
  account_number: string;

  @IsIBAN()
  iban: string;

  @IsString()
  holder_name: string;

  @IsEnum(PayoutAccountsEnum)
  status: PayoutAccountsEnum;

  @IsOptional()
  @IsBoolean()
  is_default: boolean;

  @IsOptional()
  master_id: string;
}
