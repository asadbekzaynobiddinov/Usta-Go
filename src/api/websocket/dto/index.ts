import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MessageType } from 'src/common/enum';

export class MessageBodyDto {
  @IsUUID()
  chat_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  pictures?: string[];

  @IsEnum(MessageType)
  type: MessageType;
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
