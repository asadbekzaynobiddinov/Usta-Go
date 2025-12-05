import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @IsOptional()
  user_id: string;

  @IsArray()
  @IsOptional()
  pictures: string[];
}
