import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { PaymentStatus } from './entities/payment-status.entity';
import { PaymentType } from './entities/payment-type.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { OrderStatus } from './entities/order-status.entity';
import { Common } from 'src/modules/common/entities/common.entity';
import { OrderProduct } from './entities/order-product.entity';
import { PublicOrderController } from './public-order.controller';
import { CustomerService } from 'src/modules/customer/customer.service';
import { CustomerType } from 'src/modules/customer/entities/customer-type.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE } from 'src/assets/configs/app.constant';
import { OrderProcessor } from './order.processor';
import { GuestOrderController } from './guest-order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, OrderStatus, PaymentType, PaymentStatus, 
      Product, Common, OrderProduct, Customer, CustomerType
    ]),
    BullModule.registerQueue({
      name: QUEUE.SEND_EMAIL,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: configService.get('email.type'),
          auth: {
            user: configService.get('email.sender'),
            pass: configService.get('email.password')
          }
        }
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [OrderController, PublicOrderController, GuestOrderController],
  providers: [OrderService, I18nService, CustomerService, OrderProcessor],
})
export class OrderModule {}
