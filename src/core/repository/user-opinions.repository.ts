import { Repository } from 'typeorm';
import { UserOpinions } from '../entity/user-opinions.entity';

export type UserOpinionsRepository = Repository<UserOpinions>;
