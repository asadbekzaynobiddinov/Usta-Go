import { IsOptional, IsUUID } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class OrdersFindOptionsDto extends QueryDto {
  @IsOptional()
  @IsUUID()
  user_id: string;
}
