import { Process, Processor } from '@nestjs/bull';
import { Inject, LoggerService } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from "@nestjs/config";
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TYPE } from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { QUEUE } from 'src/assets/configs/app.constant';
import * as fs from 'fs';

@Processor(QUEUE.SEND_EMAIL)
export class OrderProcessor {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Process(EMAIL_TYPE.ORDER)
  async handleSendActivation(job: Job) {
    try {
      const sender = this.configService.get('email.sender');
      const buffer = fs.readFileSync('src/assets/templates/order.html');
      let mailOptions = {
        from: sender,
        to: 'immortals307@gmail.com',
        subject: "Bạn có đơn hàng",
        html: buffer.toString().replace('%%time%%', new Date().toISOString()),
      };
      this.mailerService.sendMail(mailOptions)
      this.logger.debug(`Send order information email success`);
    } catch(err) {
      this.logger.error(`Send order information email error`);
    }
  }
}
