import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMasterServiceDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  master_id: string;
}
