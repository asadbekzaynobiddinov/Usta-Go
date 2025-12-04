import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enum';

class CoordinatesDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;
}

class AddressDto {
  @IsString()
  country: string;

  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsString()
  street: string;

  @IsString()
  building: string;

  @IsString()
  postalCode: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @IsOptional()
  @IsDateString()
  scheduled_at?: Date;

  @IsOptional()
  user_id: string;
}
