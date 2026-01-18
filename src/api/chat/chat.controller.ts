import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
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
    switch (userRole) {
      case 'admin':
      case 'superadmin':
        return this.chatService.findAll({
          relations: ['master', 'user', 'last_message'],
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
        });

      case 'user':
        return this.chatService.findAll({
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
        });

      case 'master':
        return this.chatService.findAll({
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
        });

      default:
        throw new ForbiddenException('Invalid user role');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne({
      where: { id },
      relations: ['last_message'],
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
