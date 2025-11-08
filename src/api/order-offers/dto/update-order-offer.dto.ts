import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderOfferDto } from './create-order-offer.dto';

export class UpdateOrderOfferDto extends PartialType(CreateOrderOfferDto) {}
