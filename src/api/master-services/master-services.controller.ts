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
import { MasterServicesService } from './master-services.service';
import { CreateMasterServiceDto } from './dto/create-master-service.dto';
import { UpdateMasterServiceDto } from './dto/update-master-service.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';

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
  findAll(@UserID() id: string) {
    return this.masterServicesService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterServicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterServiceDto: UpdateMasterServiceDto,
  ) {
    return this.masterServicesService.update(id, updateMasterServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterServicesService.remove(id);
  }
}
