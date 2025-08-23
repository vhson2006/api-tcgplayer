import { Body, Controller } from '@nestjs/common';
import { CORRECT } from 'src/assets/configs/app.constant';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { CreateStorageDto } from './dto/create-storage.dto';
import { StorageQueryDto } from './dto/query-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { StorageService } from './storage.service';
import { Storage } from './entities/storage.entity';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  create(@Body() createStorageDto: CreateStorageDto) {
    return this.storageService.create(createStorageDto);
  }

  findAll(@Body() query: StorageQueryDto) {
    return this.storageService.findAll(query);
  }

  findOne(@Body('id', EntityExistsPipe(Storage)) storage: Storage) {
    return {
      status: CORRECT,
      data: storage
    }
  }

  update(
    @Body('id', EntityExistsPipe(Storage)) storage: Storage, 
    @Body() updateStorageDto:  UpdateStorageDto
  ) {
    return this.storageService.update(storage, updateStorageDto);
  }

  remove(@Body('id', EntityExistsPipe(Storage)) storage: Storage) {
    return this.storageService.remove(storage);
  }
}
