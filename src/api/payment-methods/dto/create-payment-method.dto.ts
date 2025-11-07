import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Length,
  Min,
  Max,
} from 'class-validator';
import { PaymentProvider } from 'src/common/enum';

export class CreatePaymentMethodDto {
  @IsOptional()
  user_id: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @Length(4, 4)
  masked_number: string;

  @IsString()
  token: string;

  @IsInt()
  @Min(1)
  @Max(12)
  expire_month: number;

  @IsInt()
  @Min(new Date(Date.now()).getFullYear())
  @Max(2100)
  expire_year: number;

  @IsOptional()
  @IsString()
  card_holder?: string;

  @IsBoolean()
  is_default: boolean;

  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;
}
