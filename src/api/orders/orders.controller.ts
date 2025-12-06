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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';
import { QueryDto } from 'src/common/dto';

@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserID() id: string) {
    return this.ordersService.create({ ...createOrderDto, user_id: id });
  }

  @Get()
  findAll(
    @UserID() id: string,
    @UserROLE() role: string,
    @Query()
    query: QueryDto,
  ) {
    console.log(query);
    const skip = (query.page - 1) * query.limit;
    if (role === 'admin' || role === 'superadmin') {
      return this.ordersService.findAll({
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
        relations: ['pictures'],
      });
    }
    try {
      return this.ordersService.findAll({
        where: { user: { id } },
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
        relations: ['pictures'],
      });
    } catch (error) {
      console.log(error);
      return 'oops';
    }
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    if (role === 'admin' || role === 'superadmin') {
      return this.ordersService.findOne({
        where: { id },
        relations: ['pictures'],
      });
    }
    return this.ordersService.findOne({
      where: { id, user: { id: userId } },
      relations: ['pictures'],
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @UserID() userId: string,
  ) {
    return this.ordersService.update(id, updateOrderDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.ordersService.remove(id, userId);
  }
}
