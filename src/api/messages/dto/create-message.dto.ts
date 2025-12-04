import { IsEnum, IsString, IsUUID } from 'class-validator';
import { MessageType } from 'src/common/enum';

export class CreateMessageDto {
  @IsUUID()
  chat_id: string;

  @IsUUID()
  sender_id: string;

  @IsString()
  context: string;

  @IsEnum(MessageType)
  type: MessageType;
}
