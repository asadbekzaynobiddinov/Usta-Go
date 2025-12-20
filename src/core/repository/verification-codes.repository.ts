import { Repository } from 'typeorm';
import { VerificationCodes } from '../entity/verificationcodes.entity';

export type VerificationCodesRepository = Repository<VerificationCodes>;
