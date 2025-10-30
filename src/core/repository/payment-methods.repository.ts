import { Repository } from 'typeorm';
import { PaymentMethods } from '../entity/payment-methods.entity';

export type PaymentMethodsRepository = Repository<PaymentMethods>;
