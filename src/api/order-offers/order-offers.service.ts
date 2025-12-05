import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderOffers, OrderOffersRepository } from 'src/core';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class OrderOffersService {
  constructor(
    @InjectRepository(OrderOffers)
    private readonly repository: OrderOffersRepository,
  ) {}
  async create(dto: CreateOrderOfferDto) {
    const newOffer = this.repository.create({
      ...dto,
      master: { id: dto.master_id },
      order: { id: dto.orderId },
    });
    await this.repository.save(newOffer);
    return {
      status_code: 201,
      message: 'Offer created succsessfuly',
      data: newOffer,
    };
  }

  async findAll(options?: FindManyOptions<OrderOffers>) {
    const offers = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Offers fetched succsessfuly',
      data: offers,
    };
  }

  async findOne(options: FindOneOptions<OrderOffers>) {
    const offer = await this.repository.findOne(options);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return {
      status_code: 200,
      mssage: 'Offer fetched succsessfuly',
      data: offer,
    };
  }

  async update(id: string, dto: UpdateOrderOfferDto, userId: string) {
    await this.findOne({ where: { id, master: { id: userId } } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Offer updated succsessfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne({ where: { id, master: { id: userId } } });
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Offer deleted succsessful',
      data: {},
    };
  }
}
