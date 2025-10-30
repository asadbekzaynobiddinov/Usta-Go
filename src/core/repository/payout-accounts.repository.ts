import { Repository } from 'typeorm';
import { PayoutAccounts } from '../entity/payout-accounts.entity';

export type PayoutAccountsRepository = Repository<PayoutAccounts>;
