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
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserGuard } from 'src/common/guard/user.guard';
import { UpdateUserQuery } from './dto/update-user-query.dto';
import { UserROLE } from 'src/common/decorator/user-role.decorator';

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

  @UseGuards(UserGuard)
  @Get('me')
  getMe(@UserID() id: string) {
    return this.userService.getMe(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Query() query: UpdateUserQuery,
    @Body() updateUserDto: UpdateUserDto,
    @UserID() userId: string,
    @UserROLE() userRole: string,
  ) {
    if ((userRole === 'admin' || userRole === 'superadmin') && query.user_id) {
      return this.userService.update(query.user_id, updateUserDto);
    }
    return this.userService.update(userId, updateUserDto);
  }

  @UseGuards(SelfGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
