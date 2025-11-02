import { Repository } from 'typeorm';
import { MasterProfile } from '../entity/master-profile.entity';

export type MasterProfileRepository = Repository<MasterProfile>;
