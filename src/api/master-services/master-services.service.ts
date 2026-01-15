import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMasterServiceDto } from './dto/create-master-service.dto';
import { UpdateMasterServiceDto } from './dto/update-master-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MasterServicesRepository,
  MasterServices,
  PicturesOfMasterServices,
  PicturesOfMasterServicesRepository,
} from 'src/core';
import { FindManyOptions, FindOneOptions } from 'typeorm';

@Injectable()
export class MasterServicesService {
  constructor(
    @InjectRepository(MasterServices)
    private readonly repository: MasterServicesRepository,
    @InjectRepository(PicturesOfMasterServices)
    private readonly picturesOfMasterServicesRepository: PicturesOfMasterServicesRepository,
  ) {}
  async create(dto: CreateMasterServiceDto) {
    const { pictures, ...data } = dto;

    const newService = this.repository.create({
      master: { id: dto.master_id },
      ...data,
    });

    await this.repository.save(newService);

    const picturesOfService: PicturesOfMasterServices[] = [];

    if (pictures?.length) {
      for (const pic of pictures) {
        const newPicture = await this.picturesOfMasterServicesRepository.save(
          this.picturesOfMasterServicesRepository.create({
            service: { id: newService.id },
            picture_url: pic,
          }),
        );
        picturesOfService.push(newPicture);
      }
    }

    return {
      status_code: 201,
      message: 'Master service created successfuly',
      data: { ...newService, pictures: picturesOfService },
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
    const existsService = (await this.findOne({ where: { id } })).data;

    const { pictures, ...updateData } = dto;
    await this.repository.update({ id }, { ...updateData });

    if (pictures?.length) {
      for (const pic of pictures) {
        if (!pic.id) {
          await this.picturesOfMasterServicesRepository.save(
            this.picturesOfMasterServicesRepository.create({
              service: { id: existsService.id },
              picture_url: pic.picture_url,
            }),
          );
        } else {
          await this.picturesOfMasterServicesRepository.update(
            { id: pic.id },
            { picture_url: pic.picture_url },
          );
        }
      }
    }

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
