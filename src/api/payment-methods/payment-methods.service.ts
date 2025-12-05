import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethods, PaymentMethodsRepository } from 'src/core';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethods)
    private readonly repository: PaymentMethodsRepository,
  ) {}
  async create(dto: CreatePaymentMethodDto) {
    const newPaymentMethod = this.repository.create({
      user: { id: dto.user_id },
      ...dto,
    });

    await this.repository.save(newPaymentMethod);

    return {
      status_code: 201,
      message: 'Payment method created succsessfuly',
      data: newPaymentMethod,
    };
  }

  async findAll(options?: FindManyOptions<PaymentMethods>) {
    const paymentMethods = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Payment methods fetched succsessfuly',
      data: paymentMethods,
    };
  }

  async findOne(options: FindOneOptions<PaymentMethods>) {
    const paymentMethod = await this.repository.findOne(options);
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    return {
      status_code: 200,
      message: 'Payment method fetched succsessfuly',
      data: paymentMethod,
    };
  }

  async update(id: string, dto: UpdatePaymentMethodDto, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Payment method updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne({ where: { id, user: { id: userId } } });
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Payment method deleted succsessfuly',
      data: {},
    };
  }
}
