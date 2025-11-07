import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PayoutAccountsService } from './payout-accounts.service';
import { CreatePayoutAccountDto } from './dto/create-payout-account.dto';
import { UpdatePayoutAccountDto } from './dto/update-payout-account.dto';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';

@UseGuards(JwtGuard)
@Controller('payout-accounts')
export class PayoutAccountsController {
  constructor(private readonly payoutAccountsService: PayoutAccountsService) {}

  @Post()
  create(
    @Body() createPayoutAccountDto: CreatePayoutAccountDto,
    @UserID() id: string,
  ) {
    return this.payoutAccountsService.create({
      ...createPayoutAccountDto,
      master_id: id,
    });
  }

  @Get()
  findAll(@UserID() id: string) {
    return this.payoutAccountsService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutAccountsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePayoutAccountDto: UpdatePayoutAccountDto,
  ) {
    return this.payoutAccountsService.update(id, updatePayoutAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutAccountsService.remove(id);
  }
}
