import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { AccessCodeQueryDto } from './dto/query-access-code.dto';
import { AccessCode } from './entities/access-code.entity';
import { Common } from 'src/modules/common/entities/common.entity';
import { ACCESS_CODE_STATUS, ACCESS_CODE_TYPE } from 'src/assets/configs/app.common';
import { generateNumber } from 'src/assets/utils/code';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AccessCodeService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(AccessCode) private readonly accessCodeRepository: Repository<AccessCode>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createAccessCodeDto: CreateAccessCodeDto) {
    try {      
      const { type, status, selectedDates, ...others } = createAccessCodeDto;
      const commonData = await this.commonRepository.findBy([
        { group: ACCESS_CODE_STATUS.GROUP, type: status },
        { group: ACCESS_CODE_TYPE.GROUP, type: type },
      ]);
      const { identifiers } = await this.accessCodeRepository.insert({
        ...others,
        code: generateNumber(),
        statusId: commonData.find((c: any) => c.type === status && c.group === ACCESS_CODE_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === ACCESS_CODE_TYPE.GROUP)?.id,
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

  async findAll(query: AccessCodeQueryDto) {
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
            { code: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.accessCodeRepository.findAndCount(queryObj);
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
      const entity = await this.accessCodeRepository.findOne({ where: { id } });
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
  async update(accessCode: AccessCode, updateAccessCodeDto: UpdateAccessCodeDto) {
    try {
      const { type, status, selectedDates, ...others } = updateAccessCodeDto
      const commonData = await this.commonRepository.findBy([
        { group: ACCESS_CODE_STATUS.GROUP, type: status },
        { group: ACCESS_CODE_TYPE.GROUP, type: type },
      ]);
      const response = await this.accessCodeRepository.update(
        accessCode.id, 
        {
          ...others,
          statusId: commonData.find((c: any) => c.type === status && c.group === ACCESS_CODE_STATUS.GROUP)?.id,
          typeId: commonData.find((c: any) => c.type === type && c.group === ACCESS_CODE_TYPE.GROUP)?.id,
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
  async remove(accessCode: AccessCode) {
    try {
      const updateResponse = await this.accessCodeRepository.update(accessCode.id, { 
        code: `${accessCode.code}-${accessCode.id}`, 
      });
      
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }

      const response = await this.accessCodeRepository.softDelete(accessCode.id);
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
