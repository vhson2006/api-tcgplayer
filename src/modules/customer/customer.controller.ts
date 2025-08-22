import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CustomerQueryDto } from './dto/query-customer.dto';
import { Customer } from './entities/customer.entity';

@Auth(AuthType.Bearer)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.CUSTOMER}`)
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const response = await this.customerService.create(createCustomerDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.CUSTOMER}`)
  @Get()
  async findAll(@Query() query: CustomerQueryDto) {
    const customer = await this.customerService.findAll(query);
    
    return {
      status: CORRECT,
      ...customer
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.CUSTOMER}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.customerService.findOne(id);
    return customer
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.CUSTOMER}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Customer)) customer: Customer, 
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const response = await this.customerService.update(customer, updateCustomerDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.CUSTOMER}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Customer)) customer: Customer) {
    const response = await this.customerService.remove(customer);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
