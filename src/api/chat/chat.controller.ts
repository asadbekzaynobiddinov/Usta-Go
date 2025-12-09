import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll() {
    return this.chatService.findAll();
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
