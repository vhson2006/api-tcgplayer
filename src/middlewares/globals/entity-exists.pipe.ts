import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export function EntityExistsPipe(entityCls: Type): Type<PipeTransform> {
  @Injectable()
  class EntityExistsPipeCls implements PipeTransform {
    constructor(
      @InjectRepository(entityCls)
      private entityRepository: Repository<any>,
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
      const entity = await this.entityRepository.findOne({ where: { id: value } }); // throws if entity does not exist
      if (!entity) {
        throw new NotFoundException();
      }
      return entity;
    }
  }
  return EntityExistsPipeCls;
}