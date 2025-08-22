import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import {CLOUDINARY, CORRECT, DEFAULT_PAGE, DEFAULT_SIZE, INCORRECT, MAX_SIZE, QUEUE } from 'src/assets/configs/app.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from 'src/modules/media/entities/media.entity';
import { Like, Repository } from 'typeorm';
import { MEDIA_STATUS } from 'src/assets/configs/app.common';
import { MediaStatus } from './entities/media-status.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Transactional } from 'typeorm-transactional';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaQueryDto } from './dto/query-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { ProductProductImage } from 'src/modules/product/entities/product-product-image.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Common } from '../common/entities/common.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectQueue(QUEUE.UPLOAD_IMAGE) private readonly imageUploadQueue: Queue,
    private readonly i18nService: I18nService,
    @InjectRepository(Media) private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @InjectRepository(MediaStatus) private readonly mediaStatusRepository: Repository<MediaStatus>,
    @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectRepository(ProductProductImage) private readonly productProductImageRepository: Repository<ProductProductImage>
  ) {}
  
  @Transactional()
  async create(createMediaDto: CreateMediaDto) {
    try {     
      const { file, ...others } = createMediaDto;
      const media = await this.mediaRepository.findOneBy({ id: file });
      if (!media) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.UNSUCCESS')
        };
      }
      const assignStatus = await this.commonRepository.findOneBy({ 
        group: MEDIA_STATUS.GROUP, 
        type: MEDIA_STATUS.ASSIGN 
      });
      const response = await this.mediaRepository.update(
        file, 
        {
          ...others,
          statusId: assignStatus?.id,
        }
      );
      if (response.affected > 0) {
        return CORRECT;
      }

      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  async findAll(query: MediaQueryDto) {
    try {
      const { search, page, size } = query;
      let queryObj: any = {
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (search) {
        queryObj = {
          ...queryObj, 
          where: [
            { name: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.mediaRepository.findAndCount(queryObj);
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  async findOne(id: string) {
    try {
      const entity = await this.mediaRepository.findOne({ where: { id } });
      if (!entity) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.UNSUCCESS')
        };
      }
      return { 
        status: CORRECT, 
        data: entity
      };;
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  @Transactional()
  async update(media: Media, updateMediaDto: UpdateMediaDto) {
    try {
      const { status, ...others } = updateMediaDto
      const commonData = await this.commonRepository.findBy({ group: MEDIA_STATUS.GROUP, type: status });
      const response = await this.mediaRepository.update(
        media.id, 
        {
          ...others,
          // status_id: commonData.find((c: any) => c.type === status)?.id,
        }
      );
      if (response.affected > 0) {
        return CORRECT;
      }

      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  @Transactional()
  async remove(media: Media) {
    try {
      await this.productProductImageRepository.softDelete({ productImageId: media.id });
      await this.employeeRepository.update({ avatarId: media.id },  { avatarId: null });
      const response = await this.mediaRepository.softDelete(media.id);
      if (response.affected > 0) {
        return CORRECT;
      }

      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  async upload(file: Express.Multer.File) {
    try {
      const { id } = await this.mediaStatusRepository.findOne({
        where: {
          type: MEDIA_STATUS.NEW,
          group: MEDIA_STATUS.GROUP
        }
      })

      const { identifiers } = await this.mediaRepository.insert({
        name: file.originalname,
        url: '',
        alt: file.originalname,
        fileType: file.mimetype,
        statusId: id
      })

      if (Array.isArray(identifiers) && identifiers.length > 0) {
        await this.imageUploadQueue.add(CLOUDINARY.SERVICE, { path: file.path, id: identifiers[0].id });
        return {
          id: identifiers[0].id,
          url: ''
        }
      }

      return INCORRECT
    } catch (e) {
      return INCORRECT
    }
  }

  async uploads(files: Express.Multer.File[]) {
    try {
      const uploads = await files.reduce(async (pre: any, cur: any) => {
        const res = await this.upload(cur);
        if (res === INCORRECT) {
          return pre
        }
        return [
          ...pre,
          res
        ]
      }, []);

      if ( Array.isArray(uploads) && uploads.length > 0) {
        return uploads;
      }

      return INCORRECT
    } catch (e) {
      return INCORRECT
    }
  }
}
