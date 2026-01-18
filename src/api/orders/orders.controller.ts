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
  HttpCode,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { QueryDto } from 'src/common/dto';
import { UserGuard } from 'src/common/guard/user.guard';
import { OrdersFindOptionsDto } from './dto/find-options.dto';

@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(UserGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserID() id: string) {
    return this.ordersService.create({ ...createOrderDto, user_id: id });
  }

  @UseGuards(UserGuard)
  @Get('find-my-orders')
  findMyOrders(
    @UserID() id: string,
    @Query()
    query: QueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;

    return this.ordersService.findAll({
      where: { user: { id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['master', 'offers'],
    });
  }

  @Get()
  findAll(
    @Query()
    query: OrdersFindOptionsDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    return this.ordersService.findAll({
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['pictures'],
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne({
      where: { id },
      relations: ['pictures', 'offers', 'offers.master'],
    });
  }

  @UseGuards(UserGuard)
  @Get('offers/:id')
  findAllOffers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    return this.ordersService.findAllOffers({
      where: { order: { id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
      relations: ['master'],
    });
  }

  @UseGuards(UserGuard)
  @HttpCode(200)
  @Post('accept-offer/:id')
  accceptOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @UserID() userId: string,
  ) {
    return this.ordersService.acceptOffer({
      where: { id, order: { user: { id: userId } } },
      relations: ['master', 'order'],
    });
  }

  @UseGuards(UserGuard)
  @HttpCode(200)
  @Post('reject-offer/:id')
  rejectOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @UserID() userId: string,
  ) {
    return this.ordersService.rejectOffer({
      where: { id, order: { user: { id: userId } } },
    });
  }

  @UseGuards(UserGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @UserID() userId: string,
  ) {
    return this.ordersService.update(id, updateOrderDto, userId);
  }

  @UseGuards(UserGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.ordersService.remove(id, userId);
  }
}
