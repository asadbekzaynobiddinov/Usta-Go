import { IsOptional, IsUUID } from 'class-validator';

export class UpdateMasterProfileQuery {
  @IsOptional()
  @IsUUID()
  master_id?: string;
}
