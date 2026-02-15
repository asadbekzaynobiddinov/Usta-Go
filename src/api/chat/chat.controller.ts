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
import { ChatParticipantRole, RoleAdmin } from 'src/common/enum';

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
    return this.chatService.findAll(query, userId, role);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() query: QueryDto,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    return this.chatService.findOne(id, userId, role, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }
}
