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
} from '@nestjs/common';
import { UserOpinionsService } from './user-opinions.service';
import { CreateUserOpinionDto } from './dto/create-user-opinion.dto';
import { UpdateUserOpinionDto } from './dto/update-user-opinion.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';

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
    return this.userOpinionsService.findAll({
      where: { user: { id: userId } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['pictusres'],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserID() userId: string) {
    return this.userOpinionsService.findOne({
      where: { id, user: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserOpinionDto: UpdateUserOpinionDto,
    @UserID() userId: string,
  ) {
    return this.userOpinionsService.update(id, updateUserOpinionDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserID() userId: string) {
    return this.userOpinionsService.remove(id, userId);
  }
}
