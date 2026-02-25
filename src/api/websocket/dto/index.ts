import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class MessageBodyDto {
  @IsUUID()
  chat_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  pictures?: string[];
}

export class IdDto {
  @IsUUID()
  id: string;
}

export class UpdateMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  content: string;
}
