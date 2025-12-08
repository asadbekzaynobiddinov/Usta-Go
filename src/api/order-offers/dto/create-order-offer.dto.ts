import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderOfferDto {
  @IsUUID()
  order_id: string;

  @IsNumber()
  offered_price: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  master_id?: string;
}
