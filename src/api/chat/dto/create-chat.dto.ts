import { IsUUID, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  master_id: string;

  @IsUUID()
  @IsOptional()
  user_id: string;
}
