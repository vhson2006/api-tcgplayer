import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import duplicate from 'duplicate-requests';
import * as Joi from 'joi';
import { join } from 'path';
import appConfig from 'src/assets/configs/app.config';
import { ContextIdFactory } from '@nestjs/core';
import { EmployeeModule } from './modules/employee/employee.module';
import { CommonModule } from './modules/common/common.module';
import { MediaModule } from './modules/media/media.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { PermissionModule } from './modules/permission/permission.module';
import { NewsModule } from './modules/news/news.module';
import { TagModule } from './modules/tag/tag.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OrderModule } from './modules/order/order.module';
import { GenerateModule } from './modules/generate/generate.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { EmailModule } from './modules/email/email.module';
import { CommentModule } from './modules/comment/comment.module';
import { AccessCodeModule } from './modules/access-code/access-code.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { S3Module } from './modules/s3/s3.module';
import { AggregateByLocaleContextIdStrategy } from './middlewares/globals/aggregate-by-locale.strategy';
import { I18nModule } from './middlewares/globals/i18n/i18n.module';
import { LoggingMiddleware } from './middlewares/globals/logging.middleware';
import { IamModule } from './middlewares/iam/iam.module';
import { RoleModule } from './modules/role/role.module';

ContextIdFactory.apply(new AggregateByLocaleContextIdStrategy());

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number(),
      }),
      load: [appConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [{
        rootPath: join(__dirname, '..', configService.get('global.fePath')),
        renderPath: '*',
        serveRoot: '',
        exclude: [
          `/${configService.get('api.documentUri')}*`, 
          `/${configService.get('api.prefix')}*`
        ],

      }],
      inject: [ConfigService],
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          dirname: 'logs',
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: 'logs',
          filename: 'info.log',
          level: 'debug',
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('database.type') as any,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name') as any,
        autoLoadEntities: true,
        logging: true,
        eager: true,
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    IamModule,
    I18nModule,
    S3Module,
    EmployeeModule,
    CommonModule,
    RoleModule,
    MediaModule,
    PermissionModule,
    NewsModule,
    TagModule,
    CategoryModule,
    ProductModule,
    CustomerModule,
    OrderModule,
    GenerateModule,
    VoucherModule,
    EmailModule,
    CommentModule,
    AccessCodeModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
    const config = {
      expiration: "1s",
      property: (req: { body: any; }) => JSON.stringify(req.body),
      prefix: "root"
    }
    consumer.apply(duplicate(config)).forRoutes({ path: '*', method: RequestMethod.POST });
  }
}
