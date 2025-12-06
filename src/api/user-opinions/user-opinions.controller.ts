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

@UseGuards(JwtGuard)
@Controller('user-opinions')
export class UserOpinionsController {
  constructor(private readonly userOpinionsService: UserOpinionsService) {}

  @Post()
  create(
    @Body() createUserOpinionDto: CreateUserOpinionDto,
    @UserID() userId: string,
  ) {
    return this.userOpinionsService.create({
      ...createUserOpinionDto,
      user_id: userId,
    });
  }

  @Get()
  findAll(
    @UserID() userId: string,
    @UserROLE() role: string,
    @Query()
    query: {
      page: number;
      limit: number;
      orderBy: string;
      order: 'ASC' | 'DESC';
    },
  ) {
    query.orderBy = 'created_at';
    query.order = 'DESC';
    const skip = (query.page - 1) * query.limit;
    if (role === 'admin' || role === 'superadmin') {
      return this.userOpinionsService.findAll({
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
        relations: ['pictures'],
      });
    }
    return this.userOpinionsService.findAll({
      where: { user: { id: userId } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['pictures'],
    });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    if (role === 'admin' || role === 'superadmin') {
      return this.userOpinionsService.findOne({ where: { id } });
    }
    return this.userOpinionsService.findOne({
      where: { id, user: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserOpinionDto: UpdateUserOpinionDto,
    @UserID() userId: string,
  ) {
    return this.userOpinionsService.update(id, updateUserOpinionDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.userOpinionsService.remove(id, userId);
  }
}
