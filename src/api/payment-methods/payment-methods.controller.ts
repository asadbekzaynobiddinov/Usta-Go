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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { QueryDto } from 'src/common/dto';

@UseGuards(JwtGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @UserID() id: string,
  ) {
    return this.paymentMethodsService.create({
      ...createPaymentMethodDto,
      user_id: id,
    });
  }

  @Get()
  findAll(
    @UserID() id: string,
    @Query()
    query: QueryDto,
  ) {
    query.orderBy = 'created_at';
    query.order = 'DESC';
    const skip = (query.page - 1) * query.limit;
    return this.paymentMethodsService.findAll({
      where: { user: { id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.paymentMethodsService.findOne({
      where: { id, user: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @UserID() userId: string,
  ) {
    return this.paymentMethodsService.update(
      id,
      updatePaymentMethodDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.paymentMethodsService.remove(id, userId);
  }
}
