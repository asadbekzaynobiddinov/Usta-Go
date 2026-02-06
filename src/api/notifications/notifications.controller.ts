import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@UserID() id: string) {
    return this.notificationsService.findAll({ where: { to: id } });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.remove(id);
  }
}
