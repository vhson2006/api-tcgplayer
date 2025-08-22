import { Process, Processor } from '@nestjs/bull';
import { Inject, LoggerService } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CLOUDINARY, QUEUE } from 'src/assets/configs/app.constant';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Processor(QUEUE.UPLOAD_IMAGE)
export class MediaProcessor {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CLOUDINARY.PROVIDER) private readonly cloudinary: any,
    @InjectRepository(Media) private readonly mediaRepository: Repository<Media>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Process(CLOUDINARY.SERVICE)
  async handleRegister(job: Job) {
    try {
      const { data } = job;
      this.logger.debug(`Start upload avatar: ${JSON.stringify(data)}`);
      const { secure_url } = await this.cloudinary.uploader.upload(
        data.path,
        { folder: this.configService.get('cloudinary.folder') },
        function (err: any) {
          if (err) {
            this.logger.error(`${JSON.stringify(err)}`);
          }
        },
      );
      const updateMediaResponse = await this.mediaRepository.update(
        data.id, 
        { url: secure_url }
      );
      if (updateMediaResponse.affected > 0) {
        this.logger.debug(`Upload avatar completed: ${JSON.stringify(data)}`);
      } else {
        this.logger.debug(`Upload avatar can't process: ${JSON.stringify(data)}`);
      }
    } catch(err) {
      this.logger.error(`Upload avatar error: ${JSON.stringify(err)}`);
    }
  }
}
