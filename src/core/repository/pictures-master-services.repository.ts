import { Repository } from 'typeorm';
import { PicturesOfMasterServices } from '../entity/pictures-master-services.entity';

export type PicturesOfMasterServicesRepository =
  Repository<PicturesOfMasterServices>;
