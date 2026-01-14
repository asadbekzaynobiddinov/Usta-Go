import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMasterServiceDto } from './dto/create-master-service.dto';
import { UpdateMasterServiceDto } from './dto/update-master-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterServicesRepository, MasterServices } from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class MasterServicesService {
  constructor(
    @InjectRepository(MasterServices)
    private readonly repository: MasterServicesRepository,
  ) {}
  async create(dto: CreateMasterServiceDto) {
    const newService = this.repository.create({
      master: { id: dto.master_id },
      ...dto,
    });
    await this.repository.save(newService);
    return {
      status_code: 201,
      message: 'Master service created successfuly',
      data: newService,
    };
  }

  async findAll(options?: FindManyOptions<MasterServices>) {
    const services = await this.repository.find(options);
    return {
      status_code: 200,
      message: 'Master services fetched successfuly',
      data: services,
    };
  }

  async findOne(options: FindOneOptions<MasterServices>) {
    const service = await this.repository.findOne(options);
    if (!service) {
      throw new NotFoundException('Master service not found');
    }
    return {
      status_code: 200,
      message: 'Master service fetched successfuly',
      data: service,
    };
  }

  async update(id: string, dto: UpdateMasterServiceDto) {
    await this.findOne({ where: { id } });
    await this.repository.update({ id }, { ...dto });
    return {
      status_code: 200,
      message: 'Master service updated successfuly',
      data: (await this.findOne({ where: { id } })).data,
    };
  }

  async remove(id: string) {
    await this.findOne({ where: { id } });
    try {
      await this.repository.delete({ id });
    } catch (error) {
      console.log(error);
    }
    return {
      status_code: 200,
      message: 'Master service deleted successfuly',
      data: {},
    };
  }
}
