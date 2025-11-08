import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderOfferDto {
  @IsNumber()
  offered_price: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  masterId?: string;
}
