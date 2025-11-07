import { TargetRole } from 'src/common/enum';

export class CreateNotificationDto {
  title: string;
  body: string;
  user_id?: string;
  master_id?: string;
  target_role: TargetRole;
  is_read?: boolean;
}
