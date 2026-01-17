import {
  Controller,
  Get,
  Body,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { SelfGuard } from 'src/common/guard/self.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto } from 'src/common/dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query() query: QueryDto) {
    const skip = (query.page - 1) * query.limit;
    return this.userService.findAll({
      skip,
      take: query.limit,
      relations: ['master_profile'],
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneById(id);
  }

  @Get('me')
  getMe() {
    return this.userService;
  }

  @UseGuards(SelfGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(SelfGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
