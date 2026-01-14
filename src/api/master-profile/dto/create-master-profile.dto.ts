import {
  IsString,
  IsEnum,
  IsUrl,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { MasterGender, MasterStatus } from 'src/common/enum';

export class CreateMasterProfileDto {
  @IsEnum(MasterGender, { message: 'Gender shoud be "male" or "female"' })
  gender: MasterGender;

  @IsArray()
  occupations: string[];

  @IsUrl()
  passport_image_url: string;

  @IsUrl()
  selfie_image_url: string;

  @IsOptional()
  user_id?: string;

  @IsOptional()
  @IsEnum(MasterStatus)
  status?: MasterStatus;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  experience: number;
}
