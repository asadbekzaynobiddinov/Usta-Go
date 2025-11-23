import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MasterProfileService } from './master-profile.service';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';
import { SelfGuard } from 'src/common/guard/self.guard';

@UseGuards(JwtGuard)
@Controller('master-profile')
export class MasterProfileController {
  constructor(private readonly masterProfileService: MasterProfileService) {}

  @Get('get-token')
  getToken(@UserID() id: string) {
    return this.masterProfileService.getToken(id);
  }

  @Post()
  create(
    @Body() createMasterProfileDto: CreateMasterProfileDto,
    @UserID() id: string,
  ) {
    return this.masterProfileService.create({
      ...createMasterProfileDto,
      user_id: id,
    });
  }

  @Get()
  findAll() {
    return this.masterProfileService.findAll({ relations: ['services'] });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterProfileService.findOneById(id);
  }

  @UseGuards(SelfGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterProfileDto: UpdateMasterProfileDto,
  ) {
    return this.masterProfileService.update(id, updateMasterProfileDto);
  }

  @UseGuards(SelfGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterProfileService.delete(id);
  }
}
