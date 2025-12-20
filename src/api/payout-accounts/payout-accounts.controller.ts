import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PayoutAccountsService } from './payout-accounts.service';
import { CreatePayoutAccountDto } from './dto/create-payout-account.dto';
import { UpdatePayoutAccountDto } from './dto/update-payout-account.dto';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { QueryDto } from 'src/common/dto';
import { MasterGuard } from 'src/common/guard/master.guard';

@UseGuards(JwtGuard, MasterGuard)
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
  findAll(
    @UserID() id: string,
    @Query()
    query: QueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    query.orderBy = 'created_at';
    query.order = 'ASC';
    return this.payoutAccountsService.findAll({
      where: { master: { id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.payoutAccountsService.findOne({
      where: { id, master: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePayoutAccountDto: UpdatePayoutAccountDto,
    @UserID() userId: string,
  ) {
    return this.payoutAccountsService.update(
      id,
      updatePayoutAccountDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @UserID() userId: string) {
    return this.payoutAccountsService.remove(id, userId);
  }
}
