import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { OrderQueryDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';

@Auth(AuthType.Bearer)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.ORDER}`)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const response = await this.orderService.create(createOrderDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ORDER}`)
  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    const order = await this.orderService.findAll(query);
    
    return {
      status: CORRECT,
      ...order
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ORDER}`)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const order = await this.orderService.findOne(slug);
    return order
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.ORDER}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Order)) order: Order, 
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    const response = await this.orderService.update(order, updateOrderDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.ORDER}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Order)) order: Order) {
    const response = await this.orderService.remove(order);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
