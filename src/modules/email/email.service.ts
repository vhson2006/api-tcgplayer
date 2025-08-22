import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Email } from './entities/email.entity';
import { EmailQueryDto } from './dto/query-email.dto';
import { Common } from 'src/modules/common/entities/common.entity';
import { EMAIL_STATUS, EMAIL_TYPE } from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class EmailService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Email) private readonly emailRepository: Repository<Email>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createEmailDto: CreateEmailDto) {
    try {      
      const { type, status, ...others } = createEmailDto;
      const commonData = await this.commonRepository.findBy([
        // { group: EMAIL_STATUS.GROUP, type: status },
        { group: EMAIL_TYPE.GROUP, type: type },
      ]);
      const { identifiers } = await this.emailRepository.insert({
        ...others,
        // status_id: commonData.find((c: any) => c.type === status && c.group === EMAIL_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === EMAIL_TYPE.GROUP)?.id,
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

  async findAll(query: EmailQueryDto) {
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
            { title: Like(`%${search}%`) },
            { content: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.emailRepository.findAndCount(queryObj);
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
      const entity = await this.emailRepository.findOne({ where: { id } });
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
  async update(email: Email, updateEmailDto: UpdateEmailDto) {
    try {
      const { type, status, ...others } = updateEmailDto
      const commonData = await this.commonRepository.findBy([
        // { group: EMAIL_STATUS.GROUP, type: status },
        { group: EMAIL_TYPE.GROUP, type: type },
      ]);
      const response = await this.emailRepository.update(
        email.id, 
        {
          ...others,
          // status_id: commonData.find((c: any) => c.type === status && c.group === EMAIL_STATUS.GROUP)?.id,
          typeId: commonData.find((c: any) => c.type === type && c.group === EMAIL_TYPE.GROUP)?.id,
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
  async remove(email: Email) {
    try {
      const response = await this.emailRepository.softDelete(email.id);
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
