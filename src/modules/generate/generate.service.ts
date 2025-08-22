import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateGenerateDto } from './dto/create-generate.dto';
import { UpdateGenerateDto } from './dto/update-generate.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { GenerateQueryDto } from './dto/query-generate.dto';
import { Generate } from './entities/generate.entity';
import { Common } from 'src/modules/common/entities/common.entity';
import { GENERATE_STATUS } from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class GenerateService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Generate) private readonly generateRepository: Repository<Generate>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createGenerateDto: CreateGenerateDto) {
    try {      
      const { status, ...others } = createGenerateDto
      const commonData = await this.commonRepository.findBy({ group: GENERATE_STATUS.GROUP, type: status });
      const { identifiers } = await this.generateRepository.insert({
        ...others,
        statusId: commonData.find((c: any) => c.type === status)?.id,
      });
      if (Array.isArray(identifiers) && identifiers.length > 0) {
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

  async findAll(query: GenerateQueryDto) {
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
            { command: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.generateRepository.findAndCount(queryObj);
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
      const entity = await this.generateRepository.findOne({ where: { id } });
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
  async update(generate: Generate, updateGenerateDto: UpdateGenerateDto) {
    try {
      
      const { status, ...others } = updateGenerateDto
      const commonData = await this.commonRepository.findBy({ group: GENERATE_STATUS.GROUP, type: status });
      const response = await this.generateRepository.update(
        generate.id, 
        {
          ...others,
          statusId: commonData.find((c: any) => c.type === status)?.id,
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
  async remove(generate: Generate) {
    try {
      
      const response = await this.generateRepository.softDelete(generate.id);
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
}
