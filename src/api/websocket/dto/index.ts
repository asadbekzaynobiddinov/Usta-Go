import { IsUUID, IsString } from 'class-validator';

export class ChatIdDto {
  @IsUUID()
  chat_id: string;
}

export class MessageBodyDto {
  @IsUUID()
  chat_id: string;

  @IsString()
  message: string;
}
