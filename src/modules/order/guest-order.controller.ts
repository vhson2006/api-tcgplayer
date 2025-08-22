import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CUSTOMER_TYPE, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from 'src/assets/configs/app.common';

import { GuestCreateOrderDto } from './dto/guest-create-order.dto';

@Auth(AuthType.None)
@Controller('guest-order')
export class GuestOrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async create(@Body() guestOrderDto: GuestCreateOrderDto) {
      const response = await this.orderService.create({
        ...guestOrderDto,
        customerId: 'guest',
        status: ORDER_STATUS.CREATE,
        paymentType: PAYMENT_TYPE.COD,
        paymentStatus: PAYMENT_STATUS.NO_PAID
      });
      if (CORRECT === response) {
        return { status: CORRECT }
      }
      return response
  }

}
