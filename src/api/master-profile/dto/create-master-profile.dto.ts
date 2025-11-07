import { IsString, IsEnum, IsUrl, IsOptional } from 'class-validator';
import { MasterGender, MasterStatus } from 'src/common/enum';

export class CreateMasterProfileDto {
  @IsEnum(MasterGender, { message: 'Gender shoud be "male" or "female"' })
  gender: MasterGender;

  @IsString()
  occupation: string;

  @IsUrl()
  passport_image_url: string;

  @IsUrl()
  selfie_image_url: string;

  @IsOptional()
  user_id?: string;

  @IsOptional()
  @IsEnum(MasterStatus)
  status?: MasterStatus;
}
