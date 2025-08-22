import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from 'src/modules/category/entities/category-group.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { TagGroup } from 'src/modules/tag/entities/tag-group.entity';
import { Tag } from 'src/modules/tag/entities/tag.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductProductTag } from './entities/product-product-tag.entity';
import { ProductTag } from './entities/product-tag.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductProductImage } from './entities/product-product-image.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { Attribute } from './entities/attribute.entity';
import { ProductStatus } from './entities/product-status.entity';
import { ProductType } from './entities/product-type.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Common } from 'src/modules/common/entities/common.entity';
import { OrderProduct } from 'src/modules/order/entities/order-product.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { PublicProductController } from './public-product.controller';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { Storage } from 'src/modules/storage/entities/storage.entity';
import { S3Service } from 'src/modules/s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, ProductStatus, ProductType,
      ProductTag, Tag, TagGroup, ProductProductTag,
      ProductCategory, Category, CategoryGroup,
      ProductImage, ProductProductImage,
      Attribute, ProductAttribute, Common,
      Order, OrderProduct, MediaStatus, Storage
    ]),
    MulterModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            dest: configService.get('global.temp'),
          }),
          inject: [ConfigService],
        }),
  ],
  controllers: [ProductController, PublicProductController],
  providers: [ProductService, I18nService, S3Service],
})
export class ProductModule {}
