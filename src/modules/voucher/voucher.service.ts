import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { VoucherQueryDto } from './dto/query-voucher.dto';
import { Voucher } from './entities/voucher.entity';
import { VOUCHER_CONDITION, VOUCHER_STATUS, VOUCHER_TYPE } from 'src/assets/configs/app.common';
import { Common } from 'src/modules/common/entities/common.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class VoucherService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createVoucherDto: CreateVoucherDto) {
    try {      
      const { code, type, status, conditionType, ...others } = createVoucherDto
      const uniqueCheck = await this.voucherRepository.findOne({
        where: {
          code: code
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      const commonData = await this.commonRepository.findBy([
        { group: VOUCHER_STATUS.GROUP, type: status },
        { group: VOUCHER_TYPE.GROUP, type: type },
        { group: VOUCHER_CONDITION.GROUP, type: conditionType }
      ]);

      const { identifiers } = await this.voucherRepository.insert({
        ...others,
        code,
        statusId: commonData.find((c: any) => c.type === status && c.group === VOUCHER_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === VOUCHER_TYPE.GROUP)?.id,
        conditionTypeId: commonData.find((c: any) => c.type === conditionType && c.group === VOUCHER_CONDITION.GROUP)?.id,
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

  async findAll(query: VoucherQueryDto) {
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
      const response = await this.voucherRepository.findAndCount(queryObj);
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
      const entity = await this.voucherRepository.findOne({ where: { id } });
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
  async update(voucher: Voucher, updateVoucherDto: UpdateVoucherDto) {
    try {
      const { code, status, type, conditionType, ...others } = updateVoucherDto
      const uniqueCheck = await this.voucherRepository.findOne({
        where: {
          code: code,
          id: Not(voucher.id)
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      const commonData = await this.commonRepository.findBy([
        { group: VOUCHER_STATUS.GROUP, type: status },
        { group: VOUCHER_TYPE.GROUP, type: type },
        { group: VOUCHER_CONDITION.GROUP, type: conditionType }
      ]);
      const response = await this.voucherRepository.update(
        voucher.id, 
        {
          ...others,
          statusId: commonData.find((c: any) => c.type === status && c.group === VOUCHER_STATUS.GROUP)?.id,
          typeId: commonData.find((c: any) => c.type === type && c.group === VOUCHER_TYPE.GROUP)?.id,
          conditionTypeId: commonData.find((c: any) => c.type === conditionType && c.group === VOUCHER_CONDITION.GROUP)?.id,
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
  async remove(voucher: Voucher) {
    try {
      const updateResponse = await this.voucherRepository.update(voucher.id, { 
        code: `${voucher.code}-${voucher.id}` 
      });
      
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }
      const response = await this.voucherRepository.softDelete(voucher.id);
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
