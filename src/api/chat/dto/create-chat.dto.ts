import { Type } from 'class-transformer';
import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { ChatParticipantRole } from 'src/common/enum';

class ParticipantsDto {
  @IsUUID()
  id: string;

  @IsEnum(ChatParticipantRole)
  role: ChatParticipantRole;
}

export class CreateChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ParticipantsDto)
  participants: ParticipantsDto[];
}
