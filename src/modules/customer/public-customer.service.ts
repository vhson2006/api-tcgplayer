import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CustomerQueryDto } from './dto/query-customer.dto';
import { Customer } from './entities/customer.entity';
import { CustomerType } from './entities/customer-type.entity';
import { CUSTOMER_TYPE } from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class PublicCustomerService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerType) private readonly customerTypeRepository: Repository<CustomerType>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  async findOne(id: string) {
    try {
      const entity = await this.customerRepository.findOne({ where: { id } });
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
  async update(customer: any, updateCustomerDto: UpdateCustomerDto) {
    try {
      const { name, address } = updateCustomerDto
      const response = await this.customerRepository.update(customer.sub,  { name, address });
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
