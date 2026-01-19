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
import { MasterServicesService } from './master-services.service';
import { CreateMasterServiceDto } from './dto/create-master-service.dto';
import { UpdateMasterServiceDto } from './dto/update-master-service.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { MasterGuard } from 'src/common/guard/master.guard';
import { MasterServicesFindDto } from './dto/find-options.dto';
import { SearchServiceDto } from './dto/search-services.dto';

@UseGuards(JwtGuard)
@Controller('master-services')
export class MasterServicesController {
  constructor(private readonly masterServicesService: MasterServicesService) {}

  @UseGuards(MasterGuard)
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
    @Query()
    query: MasterServicesFindDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    query.orderBy = 'created_at';
    query.order = 'DESC';
    return this.masterServicesService.findAll({
      where: { master: { id: query.master_id } },
      skip,
      take: query.limit,
      order: { [query.orderBy]: query.order },
    });
  }

  @Get('search')
  search(@Query() query: SearchServiceDto) {
    return this.masterServicesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.masterServicesService.findOne({
      where: { id },
      relations: ['master'],
    });
  }

  @UseGuards(MasterGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMasterServiceDto: UpdateMasterServiceDto,
  ) {
    return this.masterServicesService.update(id, updateMasterServiceDto);
  }

  @UseGuards(MasterGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.masterServicesService.remove(id);
  }
}
