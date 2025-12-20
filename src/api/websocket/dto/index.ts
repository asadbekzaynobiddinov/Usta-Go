import { IsUUID, IsString, IsArray, IsOptional } from 'class-validator';

export class MessageBodyDto {
  @IsUUID()
  chat_id: string;

  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  pictures?: string[];

  @IsOptional()
  @IsUUID()
  @IsString()
  sender_id?: string;
}
