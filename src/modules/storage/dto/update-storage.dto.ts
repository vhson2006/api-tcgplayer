import { PartialType } from '@nestjs/swagger';
import { CreateStorageDto } from 'src/modules/storage/dto/create-storage.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateStorageDto extends PartialType(CreateStorageDto) {


  
}
