import { Repository } from 'typeorm';
import { OrderOffers } from '../entity/order-offers.entity';

export type OrderOffersRepository = Repository<OrderOffers>;
