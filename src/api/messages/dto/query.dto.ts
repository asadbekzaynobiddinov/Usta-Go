import { IsUUID } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class MessageQueryDto extends QueryDto {
  @IsUUID()
  chat_id: string;
}
