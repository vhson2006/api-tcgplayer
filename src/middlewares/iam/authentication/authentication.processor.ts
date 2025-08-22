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
export class AuthenticationProcessor {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Process(EMAIL_TYPE.ACTIVATION)
  async handleSendActivation(job: Job) {
    try {
      const { data } = job;
      const { code, email } = data
      const sender = this.configService.get('email.sender');
      const buffer = fs.readFileSync('src/assets/templates/activation.html');
      let mailOptions = {
        from: sender,
        to: email,
        subject: "Kích hoạt tài khoản",
        html: buffer.toString()
          .replace('%%url%%', `${this.configService.get('global.feDomain')}/auth/activation?token="${code}"&email="${email}"`)
          .replace('%%email%%', email)
          .replace('%%time%%', new Date().toISOString()),
      };
      this.mailerService.sendMail(mailOptions)
      this.logger.debug(`Send account activation email: ${JSON.stringify(data)}`);
    } catch(err) {
      this.logger.error(`Send account activation email error: ${JSON.stringify(err)}`);
    }
  }

  @Process(EMAIL_TYPE.OTP)
  async handleSendOtp(job: Job) {
    try {
      const { data } = job;
      const { code, email } = data
      const sender = this.configService.get('email.sender');
      const buffer = fs.readFileSync('src/assets/templates/otp.html');
      let mailOptions = {
        from: sender,
        to: email,
        subject: "Mã bảo mật",
        html: buffer.toString()
          .replace('%%code%%', code)
          .replace('%%email%%', email)
          .replace('%%time%%', new Date().toISOString()),
      };
      this.mailerService.sendMail(mailOptions)
      this.logger.debug(`Send OTP email: ${JSON.stringify(data)}`);
    } catch(err) {
      this.logger.error(`Send OTP email error: ${JSON.stringify(err)}`);
    }
  }
}
