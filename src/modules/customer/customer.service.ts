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
export class CustomerService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerType) private readonly customerTypeRepository: Repository<CustomerType>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const { phone, ...others } = createCustomerDto
      const uniqueCheck = await this.customerRepository.findOne({
        where: {
          phone: phone
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      const { id: typeId } = await this.customerTypeRepository.findOneBy({ 
        type: CUSTOMER_TYPE.NEW,
        group: CUSTOMER_TYPE.GROUP
      });

      const { identifiers } = await this.customerRepository.insert({ 
        ...others, 
        typeId,
        phone 
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

  async findAll(query: CustomerQueryDto) {
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
            { address: Like(`%${search}%`) },
            { name: Like(`%${search}%`) },
            { phone: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.customerRepository.findAndCount(queryObj);
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
  async update(customer: Customer, updateCustomerDto: UpdateCustomerDto) {
    try {
      const { phone, ...others } = updateCustomerDto
      const uniqueCheck = await this.customerRepository.findOne({
        where: {
          phone: phone,
          id: Not(customer.id)
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      const response = await this.customerRepository.update(
        customer.id, 
        { ...others, phone }
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
  async remove(customer: Customer) {
    try {
      const updateResponse = await this.customerRepository.update(customer.id, { 
        phone: `${customer.phone}-${customer.id}` 
      });
      
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }
      const response = await this.customerRepository.softDelete(customer.id);
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
