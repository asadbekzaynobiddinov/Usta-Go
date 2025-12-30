import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';
import { QueryDto } from 'src/common/dto';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(
    @UserID() userId: string,
    @UserROLE() userRole: string,
    @Query() query: QueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    console.log(userRole);
    if (userRole === 'admin' || userRole === 'superadmin') {
      return this.chatService.findAll({
        relations: ['master', 'user'],
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
      });
    } else if (userRole === 'user') {
      return this.chatService.findAll({
        where: { user: { id: userId } },
        relations: ['master'],
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
      });
    } else if (userRole === 'master') {
      return this.chatService.findAll({
        where: { master: { id: userId } },
        relations: ['user'],
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
