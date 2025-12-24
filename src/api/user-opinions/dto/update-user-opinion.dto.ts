import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class PicturesDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUrl()
  picture_url: string;
}

export class UpdateUserOpinionDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => PicturesDto)
  pictures?: PicturesDto[];
}
