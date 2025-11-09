import {
  IsUUID,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateUserOpinionDto {
  @IsOptional()
  userId?: string;

  @IsUUID()
  masterId: string;

  @IsUUID()
  orderId: string;

  @IsString()
  coment: string;

  @IsOptional()
  @IsArray()
  pictures: string[];

  @IsNumber()
  rating: number;
}
