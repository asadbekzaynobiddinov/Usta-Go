import { IsUUID, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ChatParticipantRole } from 'src/common/enum';

class ParticipantsDto {
  @IsUUID()
  id: string;

  @IsEnum(ChatParticipantRole)
  role: ChatParticipantRole;
}

export class CreateChatDto {
  @IsArray()
  @ValidateNested()
  participants: ParticipantsDto[];
}
