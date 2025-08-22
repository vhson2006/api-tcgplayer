import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Storage
    ]),
  ],
  controllers: [StorageController],
  providers: [I18nService, StorageService],
})
export class StorageModule {}
