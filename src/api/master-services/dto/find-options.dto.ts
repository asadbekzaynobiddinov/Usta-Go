import { IsUUID } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class MasterServicesFindDto extends QueryDto {
  @IsUUID()
  master_id: string;
}
