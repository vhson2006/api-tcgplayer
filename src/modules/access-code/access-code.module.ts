import { Module } from '@nestjs/common';
import { AccessCodeController } from './access-code.controller';
import { AccessCodeService } from './access-code.service';
import { AccessCode } from './entities/access-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { AccessCodeStatus } from './entities/access-code-status.entity';
import { AccessCodeType } from './entities/access-code-type.entity';
import { Common } from '../common/entities/common.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessCode, AccessCodeStatus, AccessCodeType, Common])
  ],
  controllers: [AccessCodeController],
  providers: [AccessCodeService, I18nService],
})
export class AccessCodeModule {}
