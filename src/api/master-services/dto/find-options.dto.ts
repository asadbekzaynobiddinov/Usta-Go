import { IsUUID } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class MasterServicesFIndDto extends QueryDto {
  @IsUUID()
  master_id: string;
}
