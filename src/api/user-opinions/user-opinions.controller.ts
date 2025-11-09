import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserOpinionsService } from './user-opinions.service';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('user-opinions')
export class UserOpinionsController {
  constructor(private readonly userOpinionsService: UserOpinionsService) {}

  @Post()
  create(@Body() createUserOpinionDto: CreateUserOpinionDto) {
    return this.userOpinionsService.create(createUserOpinionDto);
  }

  @Get()
  findAll() {
    return this.userOpinionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userOpinionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserOpinionDto: UpdateUserOpinionDto,
  ) {
    return this.userOpinionsService.update(id, updateUserOpinionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userOpinionsService.remove(id);
  }
}
