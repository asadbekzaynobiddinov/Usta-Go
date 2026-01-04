import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { MessageQueryDto } from './dto/query.dto';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get()
  findAll(@Query() query: MessageQueryDto) {
    const skip = (query.page - 1) * query.limit;
    return this.messagesService.findAll({
      where: { chat_room: { id: query.chat_id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne({ where: { id } });
  }
}
