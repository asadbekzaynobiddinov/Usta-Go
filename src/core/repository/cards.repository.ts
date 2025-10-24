import { Repository } from 'typeorm';
import { Cards } from '../entity/cards.entity';

export type CardsRepository = Repository<Cards>;
