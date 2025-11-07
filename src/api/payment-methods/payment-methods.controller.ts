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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';

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
  findAll(@UserID() id: string) {
    return this.paymentMethodsService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
}
