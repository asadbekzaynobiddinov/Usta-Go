import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderOfferDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  offered_price: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  masterId?: string;
}
