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
} from '@nestjs/common';
import { MasterServicesService } from './master-services.service';
import { CreateMasterServiceDto } from './dto/create-master-service.dto';
import { UpdateMasterServiceDto } from './dto/update-master-service.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UserROLE } from 'src/common/decorator/user-role.decorator';

@UseGuards(JwtGuard)
@Controller('master-services')
export class MasterServicesController {
  constructor(private readonly masterServicesService: MasterServicesService) {}

  @Post()
  create(
    @Body() createMasterServiceDto: CreateMasterServiceDto,
    @UserID() id: string,
  ) {
    return this.masterServicesService.create({
      ...createMasterServiceDto,
      master_id: id,
    });
  }

  @Get()
  findAll(
    @UserID() id: string,
    @UserROLE() role: string,
    @Query()
    query: {
      page: number;
      limit: number;
      orderBy: string;
      order: 'ASC' | 'DESC';
    },
  ) {
    const skip = (query.page - 1) * query.limit;
    query.orderBy = 'created_at';
    query.order = 'DESC';
    if (role === 'admin' || role === 'superAdmin') {
      return this.masterServicesService.findAll({
        skip,
        take: query.limit,
        order: { [query.orderBy]: query.order },
      });
    }
    return this.masterServicesService.findAll({
      where: { master: { id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    if (role === 'admin' || role === 'superAdmin') {
      return this.masterServicesService.findOne({ where: { id } });
    }
    return this.masterServicesService.findOne({
      where: { id, master: { id: userId } },
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterServiceDto: UpdateMasterServiceDto,
    @UserID() userId: string,
  ) {
    return this.masterServicesService.update(
      id,
      updateMasterServiceDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserID() userId: string) {
    return this.masterServicesService.remove(id, userId);
  }
}
