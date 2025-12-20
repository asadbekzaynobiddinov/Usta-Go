import {
  IsUUID,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateUserOpinionDto {
  @IsOptional()
  user_id?: string;

  @IsUUID()
  order_id: string;

  @IsString()
  coment: string;

  @IsOptional()
  @IsArray()
  pictures: string[];

  @IsNumber()
  rating: number;
}
