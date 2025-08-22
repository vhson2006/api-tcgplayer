import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { CustomerType } from './entities/customer-type.entity';
import { PublicCustomerController } from './public-customer.controller';
import { PublicCustomerService } from './public-customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerType])
  ],
  controllers: [CustomerController, PublicCustomerController],
  providers: [I18nService, CustomerService, PublicCustomerService],
})
export class CustomerModule {}
