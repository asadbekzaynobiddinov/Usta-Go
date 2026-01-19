import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
