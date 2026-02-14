import {
  IsOptional,
  IsString,
  IsEnum,
  IsObject,
  IsInt,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MasterGender } from 'src/common/enum';

export class UpdateMasterProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(MasterGender)
  gender?: MasterGender;

  @IsOptional()
  @IsArray()
  occupations?: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  experience?: number;

  @IsOptional()
  @IsString()
  passport_image_url?: string;

  @IsOptional()
  @IsString()
  selfie_image_url?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsObject()
  address?: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    building?: string;
    postal_code?: string;
    coordinates?: { lat: number; lng: number };
    accuracy?: number;
  };
}
