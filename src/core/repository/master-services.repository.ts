import { Repository } from 'typeorm';
import { MasterServices } from '../entity/master-services.entity';

export type MasterServiceRepository = Repository<MasterServices>;
