import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { OrderQueryDto } from './dto/query-order.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CUSTOMER_TYPE, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from 'src/assets/configs/app.common';
import { CustomerCreateOrderDto } from './dto/customer-create-order.dto';
import { ActiveUser } from 'src/middlewares/iam/authentication/decorators/active-user.decorator';
import { CustomerService } from 'src/modules/customer/customer.service';

@Auth(AuthType.Bearer)
@Controller('public-order')
export class PublicOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService
  ) {}

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Get()
  async findAll(@Query() query: OrderQueryDto, @ActiveUser() user: any) {
    const order = await this.orderService.findAll({
      ...query, 
      customerId: user.sub
    });
    return {
      status: CORRECT,
      ...order
    }
  }

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Post()
  async create(@Body() createOrderDto: CustomerCreateOrderDto, @ActiveUser() user: any) {
    const userData = await this.customerService.findOne(user.sub)
    if (userData.status === CORRECT) {
      const response = await this.orderService.create({
        ...createOrderDto,
        customerId: userData.data.id,
        address: userData.data.address,
        phone: userData.data.phone,
        status: ORDER_STATUS.CREATE,
        paymentType: PAYMENT_TYPE.COD,
        paymentStatus: PAYMENT_STATUS.NO_PAID
      });
      if (CORRECT === response) {
        return { status: CORRECT }
      }
      return response
    }
    return { status: INCORRECT }
  }

}
