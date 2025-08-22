import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { Email } from './entities/email.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { EmailStatus } from './entities/email-status.entity';
import { EmailType } from './entities/email-type.entity';
import { Common } from 'src/modules/common/entities/common.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email, EmailStatus, EmailType, Common])
  ],
  controllers: [EmailController],
  providers: [EmailService, I18nService],
})
export class EmailModule {}
