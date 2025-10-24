import { Repository } from 'typeorm';
import { Orders } from '../entity/orders.entity';

export type OrdersRepository = Repository<Orders>;
