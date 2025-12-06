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
import { OrderOffersService } from './order-offers.service';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';
import { QueryDto } from 'src/common/dto';

@UseGuards(JwtGuard)
@Controller('order-offers')
export class OrderOffersController {
  constructor(private readonly orderOffersService: OrderOffersService) {}

  @Post()
  create(
    @Body() createOrderOfferDto: CreateOrderOfferDto,
    @UserID() id: string,
  ) {
    return this.orderOffersService.create({
      ...createOrderOfferDto,
      master_id: id,
    });
  }

  @Get()
  findAll(
    @UserID() userId: string,
    @UserROLE() role: string,
    @Query()
    query: QueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    if (role === 'admin' || role === 'superadmin') {
      return this.orderOffersService.findAll({
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
      });
    }
    return this.orderOffersService.findAll({
      where: { master: { id: userId } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    if (role === 'admin' || role === 'superadmin') {
      return this.orderOffersService.findOne({ where: { id } });
    }
    return this.orderOffersService.findOne({
      where: { id, master: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderOfferDto: UpdateOrderOfferDto,
    @UserID() userId: string,
  ) {
    return this.orderOffersService.update(id, updateOrderOfferDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.orderOffersService.remove(id, userId);
  }
}
