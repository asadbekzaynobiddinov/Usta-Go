import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { MasterProfileService } from './master-profile.service';
import { CreateMasterProfileDto } from './dto/create-master-profile.dto';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UpdateMasterProfileDto } from './dto/update-master-profile.dto';
import { SelfGuard } from 'src/common/guard/self.guard';
import { UserGuard } from 'src/common/guard/user.guard';
import { MasterGuard } from 'src/common/guard/master.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { QueryDto } from 'src/common/dto';
import { UpdateMasterProfileQuery } from './dto/update-master-prifile-query.dto';
import { UserROLE } from 'src/common/decorator/user-role.decorator';

@UseGuards(JwtGuard)
@Controller('master-profile')
export class MasterProfileController {
  constructor(private readonly masterProfileService: MasterProfileService) {}

  @UseGuards(UserGuard)
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
  findAll(@Query() query: QueryDto) {
    return this.masterProfileService.findAll(query);
  }

  @UseGuards(MasterGuard)
  @Get('me')
  getMe(@UserID() id: string) {
    return this.masterProfileService.getMe(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.masterProfileService.findOne(id);
  }

  @Patch(':id')
  update(
    @Query() query: UpdateMasterProfileQuery,
    @Body() updateMasterProfileDto: UpdateMasterProfileDto,
    @UserID() userId: string,
    @UserROLE() role: string,
  ) {
    if ((role === 'admin' || role === 'superadmin') && query.master_id) {
      return this.masterProfileService.update(
        query.master_id,
        updateMasterProfileDto,
      );
    }
    return this.masterProfileService.update(userId, updateMasterProfileDto);
  }

  @UseGuards(SelfGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.masterProfileService.delete(id);
  }

  @UseGuards(AdminGuard)
  @Patch('verify/:id')
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.masterProfileService.verify(id);
  }
}
