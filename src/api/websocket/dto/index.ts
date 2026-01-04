import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class MessageBodyDto {
  @IsUUID()
  chat_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  pictures?: string[];

  @IsUUID()
  receiver: string;
}

export class MessageIdDto {
  @IsUUID()
  id: string;
}

export class UpdateMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  content: string;
}
