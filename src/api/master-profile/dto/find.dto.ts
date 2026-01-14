import { IsUUID } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class MasterProfileFindDto extends QueryDto {
  @IsUUID()
  master_id: string;
}
