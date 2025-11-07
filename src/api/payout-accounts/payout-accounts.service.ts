import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayoutAccounts, PayoutAccountsRepository } from 'src/core';
import { CreatePayoutAccountDto } from './dto/create-payout-account.dto';
import { UpdatePayoutAccountDto } from './dto/update-payout-account.dto';

@Injectable()
export class PayoutAccountsService {
  constructor(
    @InjectRepository(PayoutAccounts)
    private readonly repository: PayoutAccountsRepository,
  ) {}
  async create(dto: CreatePayoutAccountDto) {
    const newPayoutAccount = this.repository.create({
      master: { id: dto.master_id },
      ...dto,
    });
    try {
      await this.repository.save(newPayoutAccount);
    } catch (error) {
      console.log(error);
    }
    return {
      status_code: 201,
      message: 'Payout account created succsessfuly',
      data: newPayoutAccount,
    };
  }

  async findAll(masterId: string) {
    const payoutAccounts = await this.repository.find({
      where: { master: { id: masterId } },
    });
    return {
      status_code: 200,
      message: 'Payout accounts fetched succsessfuly',
      data: payoutAccounts,
    };
  }

  async findOne(id: string) {
    const payoutAccount = await this.repository.findOneBy({ id });
    if (!payoutAccount) {
      throw new NotFoundException('Payout account not found');
    }
    return {
      status_code: 200,
      message: 'Payout account not found',
      data: payoutAccount,
    };
  }

  async update(id: string, dto: UpdatePayoutAccountDto) {
    await this.findOne(id);
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Payout account updated succsessfuly',
      data: (await this.findOne(id)).data,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete({ id });
    return {
      status_code: 200,
      message: 'Payout account deleted succsessfuly',
      data: {},
    };
  }
}
