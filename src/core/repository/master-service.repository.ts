import { Repository } from 'typeorm';
import { MasterService } from '../entity/master-service.entity';

export type MasterServiceRepository = Repository<MasterService>;
