import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, Like } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CreateStorageDto } from './dto/create-storage.dto';
import { StorageQueryDto } from './dto/query-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';


@Injectable()
export class StorageService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Storage) private readonly storageRepository: Repository<Storage>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Transactional()
  async create(createStorageDto: CreateStorageDto) {
    try {
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async findAll(query: StorageQueryDto) {
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
            { description: Like(`%${search}%`) },
            { serial: Like(`%${search}%`) },
          ],
        }
      }
      
      const response = await this.storageRepository.findAndCount(queryObj);
      return {
        status: CORRECT,
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
  
  @Transactional()
  async update(storage: Storage, updateStorageDto: UpdateStorageDto) {
    try {
      
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
  
  @Transactional()
  async remove(storage: Storage) {
    try {
     
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
}
