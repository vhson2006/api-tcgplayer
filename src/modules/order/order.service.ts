import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE, QUEUE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, Like } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { OrderQueryDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';
import { EMAIL_TYPE, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from 'src/assets/configs/app.common';
import { Common } from 'src/modules/common/entities/common.entity';
import { OrderProduct } from './entities/order-product.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { generateNumber } from 'src/assets/utils/code';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrderService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectQueue(QUEUE.SEND_EMAIL) private readonly mailerQueue: Queue,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @InjectRepository(OrderProduct) private readonly orderProdutRepository: Repository<OrderProduct>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createOrderDto: CreateOrderDto) {
    try {
      const { status, paymentType, paymentStatus, products, ...others } = createOrderDto
      const commonData = await this.commonRepository.findBy([
        { group: ORDER_STATUS.GROUP, type: status },
        { group: PAYMENT_STATUS.GROUP, type: paymentStatus },
        { group: PAYMENT_TYPE.GROUP, type: paymentType }
      ]);
      const { identifiers } = await this.orderRepository.insert({
        ...others,
        serial: generateNumber(),
        statusId: commonData.find((c: any) => c.type === status && c.group === ORDER_STATUS.GROUP)?.id,
        paymentTypeId: commonData.find((c: any) => c.type === paymentType && c.group === PAYMENT_TYPE.GROUP)?.id,
        paymentStatusId: commonData.find((c: any) => c.type === paymentStatus && c.group === PAYMENT_STATUS.GROUP)?.id 
      });
      if (Array.isArray(identifiers) && identifiers.length > 0) {
        if (Array.isArray(products) && products.length > 0) {
          await this.orderProdutRepository.insert(products?.map((p: any) => ({
            productId: p.id,
            quantity: p.quantity,
            orderId: identifiers[0]?.id
          })))
        }
        this.mailerQueue.add(EMAIL_TYPE.ORDER, {});

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

  async findAll(query: OrderQueryDto) {
    try {
      const { customerId, search, page, size } = query;
      let queryObj: any = {
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (customerId) {
        if (search) {
          queryObj = {
            ...queryObj, 
            where: [
              { serial: Like(`%${search}%`), customerId },
              { phone: Like(`%${search}%`), customerId },
              { address: Like(`%${search}%`), customerId },
            ],
          }
        } else {
          queryObj = {
            ...queryObj, 
            where: {customerId},
          }
        }
      } else {
        if (search) {
          queryObj = {
            ...queryObj, 
            where: [
              { serial: Like(`%${search}%`) },
              { phone: Like(`%${search}%`) },
              { address: Like(`%${search}%`) },
            ],
          }
        }
      } 
      
      const response = await this.orderRepository.findAndCount(queryObj);
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
      const entity = await this.orderRepository.findOne({ where: { id } });
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
  async update(order: Order, updateOrderDto: UpdateOrderDto) {
    try {
      const { status, paymentType, paymentStatus, products, ...others } = updateOrderDto
      const commonData = await this.commonRepository.findBy([
        { group: ORDER_STATUS.GROUP, type: status },
        { group: PAYMENT_STATUS.GROUP, type: paymentStatus },
        { group: PAYMENT_TYPE.GROUP, type: paymentType }
      ]);

      const response = await this.orderRepository.update(
        order.id, 
        {
          ...others,
          statusId: commonData.find((c: any) => c.type === status && c.group === ORDER_STATUS.GROUP)?.id,
          paymentTypeId: commonData.find((c: any) => c.type === paymentType && c.group === PAYMENT_TYPE.GROUP)?.id,
          paymentStatusId: commonData.find((c: any) => c.type === paymentStatus && c.group === PAYMENT_STATUS.GROUP)?.id 
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
  async remove(order: Order) {
    try {
      await this.orderProdutRepository.softDelete({ orderId: order.id });
      const response = await this.orderRepository.softDelete(order.id);
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
