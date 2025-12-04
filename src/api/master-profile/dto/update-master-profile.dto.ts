import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsObject,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MasterGender, MasterStatus } from 'src/common/enum';

export class UpdateMasterProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wallet?: number;

  @IsOptional()
  @IsEnum(MasterGender)
  gender?: MasterGender;

  @IsOptional()
  @IsString()
  occupation?: string;

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
  @IsNumber()
  @Type(() => Number)
  rating_avg?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  rating_count?: number;

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

  @IsOptional()
  @IsEnum(MasterStatus)
  status?: MasterStatus;
}
