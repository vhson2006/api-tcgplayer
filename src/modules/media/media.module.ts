import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Media } from 'src/modules/media/entities/media.entity';
import { MediaStatus } from './entities/media-status.entity';
import { BullModule } from '@nestjs/bull';
import { MediaProcessor } from './media.processor';
import { Common } from 'src/modules/common/entities/common.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { ProductProductImage } from 'src/modules/product/entities/product-product-image.entity';
import { CLOUDINARY, QUEUE } from 'src/assets/configs/app.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, MediaStatus, Common, Employee, ProductProductImage]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get('global.temp'),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QUEUE.UPLOAD_IMAGE,
    })
  ],
  controllers: [MediaController],
  providers: [
    {
      provide: CLOUDINARY.PROVIDER,
      useFactory: async (configService: ConfigService) => {
        cloudinary.config({
          cloud_name: configService.get('cloudinary.name'),
          api_key: configService.get('cloudinary.apiKey'),
          api_secret: configService.get('cloudinary.apiSecret'),
        })
        return cloudinary;
      },
      inject: [ConfigService],
    },
    I18nService,
    MediaProcessor,
    MediaService
  ],
})
export class MediaModule {}
