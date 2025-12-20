import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserOpinionsService } from './user-opinions.service';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';
import { QueryDto } from 'src/common/dto';
import { UserGuard } from 'src/common/guard/user.guard';

@UseGuards(JwtGuard)
@Controller('user-opinions')
export class UserOpinionsController {
  constructor(private readonly userOpinionsService: UserOpinionsService) {}

  @UseGuards(UserGuard)
  @Post()
  create(@Body() createUserOpinionDto: CreateUserOpinionDto) {
    return this.userOpinionsService.create({
      ...createUserOpinionDto,
    });
  }

  @Get()
  findAll(
    @UserID() userId: string,
    @UserROLE() role: string,
    @Query()
    query: QueryDto,
  ) {
    query.orderBy = 'created_at';
    query.order = 'DESC';
    const skip = (query.page - 1) * query.limit;
    switch (role) {
      case 'master':
        return this.userOpinionsService.findAll({
          where: { master: { id: userId } },
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
          relations: ['user', 'pictures'],
        });
      case 'user':
        return this.userOpinionsService.findAll({
          where: { user: { id: userId } },
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
          relations: ['master', 'pictures'],
        });
      case 'superadmin':
      case 'admin':
        return this.userOpinionsService.findAll({
          skip,
          take: query.limit,
          order: { [query.orderBy]: query.order },
          relations: ['user', 'master', 'pictures'],
        });
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserROLE() role: string) {
    switch (role) {
      case 'master':
        return this.userOpinionsService.findOne({
          where: { id },
          relations: ['user', 'pictures'],
        });
      case 'user':
        return this.userOpinionsService.findAll({
          where: { id },
          relations: ['master', 'pictures'],
        });
      case 'superadmin':
      case 'admin':
        return this.userOpinionsService.findAll({
          where: { id },
          relations: ['user', 'master', 'pictures'],
        });
    }
  }

  @UseGuards(UserGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserOpinionDto: UpdateUserOpinionDto,
  ) {
    return this.userOpinionsService.update(id, updateUserOpinionDto);
  }

  @UseGuards(UserGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userOpinionsService.remove(id);
  }
}
