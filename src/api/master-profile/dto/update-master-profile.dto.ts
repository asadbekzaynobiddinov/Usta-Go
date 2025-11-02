import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterProfileDto } from './create-master-profile.dto';

export class UpdateMasterProfileDto extends PartialType(
  CreateMasterProfileDto,
) {}
