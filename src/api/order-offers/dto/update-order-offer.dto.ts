import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateOrderOfferDto {
  @IsOptional()
  @IsNumber()
  offered_price?: number;

  @IsOptional()
  @IsString()
  message?: string;
}
