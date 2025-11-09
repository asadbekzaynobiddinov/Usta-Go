import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderOffers, OrderOffersRepository } from 'src/core';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';

@Injectable()
export class OrderOffersService {
  constructor(
    @InjectRepository(OrderOffers)
    private readonly repository: OrderOffersRepository,
  ) {}
  async create(dto: CreateOrderOfferDto) {
    const newOffer = this.repository.create({
      ...dto,
      master: { id: dto.masterId },
      order: { id: dto.orderId },
    });
    await this.repository.save(newOffer);
    return {
      status_code: 201,
      message: 'Offer created succsessfuly',
      data: newOffer,
    };
  }

  async findAll() {
    const offers = await this.repository.find();
    return {
      status_code: 200,
      message: 'Offers fetched succsessfuly',
      data: offers,
    };
  }

  async findOne(id: string) {
    const offer = await this.repository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return {
      status_code: 200,
      mssage: 'Offer fetched succsessfuly',
      data: offer,
    };
  }

  async update(id: string, dto: UpdateOrderOfferDto) {
    await this.findOne(id);
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Offer updated succsessfuly',
      data: (await this.findOne(id)).data,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Offer deleted succsessful',
      data: {},
    };
  }
}
