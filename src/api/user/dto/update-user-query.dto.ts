import { IsUUID, IsOptional } from 'class-validator';

export class UpdateUserQuery {
  @IsOptional()
  @IsUUID()
  user_id?: string;
}
