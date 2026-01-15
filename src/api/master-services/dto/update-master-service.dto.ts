import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class PictureUpdateDto {
  @IsOptional()
  @IsUUID()
  id: string;

  @IsUrl()
  picture_url: string;
}

export class UpdateMasterServiceDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @ValidateNested()
  pictures?: PictureUpdateDto[];
}
