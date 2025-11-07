import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RoleAdmin } from '../enum';

@Injectable()
export class SelfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (
      req.user?.role &&
      req.user?.role === RoleAdmin.SUPERADMIN ||
      req.user?.role === RoleAdmin.ADMIN
    ) {
      return true;
    }
    console.log(req.user);
    if (req.params.id !== req.user.sub) {
      throw new ForbiddenException('Forbidden user');
    }
    return true;
  }
}
