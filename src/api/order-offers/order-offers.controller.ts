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
import { OrderOffersService } from './order-offers.service';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';

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
      masterId: id,
    });
  }

  @Get()
  findAll() {
    return this.orderOffersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderOffersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderOfferDto: UpdateOrderOfferDto,
  ) {
    return this.orderOffersService.update(id, updateOrderOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderOffersService.remove(id);
  }
}
