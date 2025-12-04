import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserOpinionDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsArray()
  pictures?: string[];
}
