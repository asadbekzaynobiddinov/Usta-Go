import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';
import { QueryDto } from 'src/common/dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatParticipantRole } from 'src/common/enum';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(
    @Body() createChatDto: CreateChatDto,
    @UserID() id: string,
    @UserROLE() role: ChatParticipantRole,
  ) {
    return this.chatService.create({
      participants: [{ id, role }, ...createChatDto.participants],
    });
  }

  @Get()
  findAll(
    @UserID() userId: string,
    @Query() query: QueryDto,
    @UserROLE() role: string,
  ) {
    const skip = (query.page - 1) * query.limit;
    if (role === 'admin' || role === 'superadmin') {
      return this.chatService.findAll({
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
        relations: ['messages', 'participants', 'offers'],
      });
    }
    return this.chatService.findAll({
      where: { participants: { user_id: userId } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['messages', 'participants', 'offers'],
    });
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
