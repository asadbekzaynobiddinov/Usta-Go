import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/refresh-token.entity';

export type RefreshTokenRepository = Repository<RefreshToken>;