import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Voucher } from './entities/voucher.entity';
import { ConditionType } from './entities/condition-type.entity';
import { VoucherStatus } from './entities/voucher-status.entity';
import { VoucherType } from './entities/voucher-type.entity';
import { Common } from 'src/modules/common/entities/common.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher, VoucherStatus, VoucherType, ConditionType, Common])
  ],
  controllers: [VoucherController],
  providers: [VoucherService, I18nService],
})
export class VoucherModule {}
