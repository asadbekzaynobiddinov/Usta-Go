import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsDateString,
  IsObject,
  IsArray,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enum';

class PicturesDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUrl()
  picture_url: string;
}

class CoordinatesDto {
  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}

class AddressDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsDateString()
  scheduled_at?: Date;

  @IsOptional()
  @IsDateString()
  completed_at?: Date;

  @IsOptional()
  @IsDateString()
  canceled_at?: Date;

  @IsOptional()
  @IsString()
  cancel_reason?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => PicturesDto)
  pictures?: PicturesDto[];
}
