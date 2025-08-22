import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Generate } from './entities/generate.entity';
import { GenerateStatus } from './entities/generate-status.entity';
import { Common } from 'src/modules/common/entities/common.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Generate, GenerateStatus, Common])
  ],
  controllers: [GenerateController],
  providers: [GenerateService, I18nService],
})
export class GenerateModule {}
