import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource, In, Like } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ProductCategory } from './entities/product-category.entity';
import { ProductProductTag } from './entities/product-product-tag.entity';
import { ProductTag } from './entities/product-tag.entity';
import { Product } from './entities/product.entity';
import { Common } from 'src/modules/common/entities/common.entity';
import { CATEGORY, MEDIA_STATUS, PRODUCT_STATUS, PRODUCT_TYPE, TAG } from 'src/assets/configs/app.common';
import { ProductQueryDto } from './dto/query-product.dto';
import { arrayDifference } from 'src/assets/utils/array';
import { queryBuilderProcess } from 'src/assets/utils/query';
import { TagGroup } from 'src/modules/tag/entities/tag-group.entity';
import { ProductProductImage } from './entities/product-product-image.entity';
import { ProductImage } from './entities/product-image.entity';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';
import { slugGenerator } from 'src/assets/utils/code';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { S3Service } from 'src/modules/s3/s3.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly i18nService: I18nService,
    private readonly s3Service: S3Service,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory) private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductTag) private readonly productTagRepository: Repository<ProductTag>,
    @InjectRepository(ProductProductTag) private readonly productProductTagRepository: Repository<ProductProductTag>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductProductImage) private readonly productProductImageRepository: Repository<ProductProductImage>,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
    @InjectRepository(MediaStatus) private readonly mediaStatusRepository: Repository<MediaStatus>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createProductDto: CreateProductDto) {
    try {      
      const { selectedDates, type, status, category, tags, image, attributes, name, ...others } = createProductDto;
      let params: any = others;
      if (Array.isArray(selectedDates) && selectedDates.length === 2) {
        params.starttime = selectedDates[0]
        params.endtime = selectedDates[1]
      }
      const commonData = await this.commonRepository.findBy([
        { group: PRODUCT_STATUS.GROUP, type: status },
        { group: PRODUCT_TYPE.GROUP, type: type }
      ]);
      const { id: categoryId } = await this.productCategoryRepository.findOne({
        relations: { group: true },
        where: { type: category, group: { type: CATEGORY.PRODUCT } }
      });
      const { identifiers } = await this.productRepository.insert({
        ...params,
        name,
        slug: slugGenerator(name),
        typeId: commonData.find((d: any) => d.type === type && d.group === PRODUCT_TYPE.GROUP).id,
        statusId: commonData.find((d: any) => d.type === status && d.group === PRODUCT_STATUS.GROUP).id,
        categoryId
      });
      if (Array.isArray(identifiers) && identifiers.length > 0) {
        if (image) {
          const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
            where: {
              type: MEDIA_STATUS.ASSIGN,
              group: MEDIA_STATUS.GROUP
            }
          })
          await this.productImageRepository.update(image, { statusId: mediaStatusId });
          await this.productProductImageRepository.insert({
            productImageId: image,
            productId: identifiers[0].id,
          });
        }
       
        const tagData = await this.productTagRepository.find({
          relations: { group: true },
          where: { 
            type: In(tags),
            group: { type: TAG.PRODUCT }
          },
        });
        await this.productProductTagRepository.insert(
          tagData.map((v: any) => ({
            productTagId: v.id,
            productId: identifiers[0].id,
          }))
        );

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

  async findAll(query: ProductQueryDto) {
    try {
      const { category, tag, search, page, size } = query;
      let queryObj: any = {
        relations: { productStatus: true, productTags: true, storage: true },
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (category) {
        const { id: categoryId } = await this.productCategoryRepository.findOne({
          relations: { group: true },
          where: { type: category, group: { type: CATEGORY.PRODUCT } }
        });
        if (tag) {
          if (search) {
            queryObj = {
              ...queryObj, 
              where: [
                { slug: Like(`%${search}%`), categoryId, productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { name: Like(`%${search}%`), categoryId, productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { description: Like(`%${search}%`), categoryId, productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
              ],
            }
          } else {
            queryObj = {
              ...queryObj, 
              where: {categoryId, productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED}},
            }
          }
        } else {
          if (search) {
            queryObj = {
              ...queryObj, 
              where: [
                { slug: Like(`%${search}%`), categoryId, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { name: Like(`%${search}%`), categoryId, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { description: Like(`%${search}%`), categoryId, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
              ],
            }
          } else {
            queryObj = {
              ...queryObj, 
              where: {categoryId, productStatus: {type: PRODUCT_STATUS.ACTIVED}},
            }
          }
        }
      } else {
        if (tag) {
          if (search) {
            queryObj = {
              ...queryObj, 
              where: [
                { slug: Like(`%${search}%`), productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { name: Like(`%${search}%`), productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { description: Like(`%${search}%`), productTags: {type: tag, group: { type: TAG.PRODUCT }}, productStatus: {type: PRODUCT_STATUS.ACTIVED} },
              ],
            }
          } else {
            queryObj = {
              ...queryObj, 
              where: {productStatus: {type: PRODUCT_STATUS.ACTIVED}, productTags: {type: tag, group: { type: TAG.PRODUCT }}},
            }
          }
        } else {
          if (search) {
            queryObj = {
              ...queryObj, 
              where: [
                { slug: Like(`%${search}%`), productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { name: Like(`%${search}%`), productStatus: {type: PRODUCT_STATUS.ACTIVED} },
                { description: Like(`%${search}%`), productStatus: {type: PRODUCT_STATUS.ACTIVED} },
              ],
            }
          } else {
            queryObj = {
              ...queryObj, 
              where: {productStatus: {type: PRODUCT_STATUS.ACTIVED}},
            }
          }
        }
        
      }
      
      const response = await this.productRepository.findAndCount(queryObj);
      return {
        data: await Promise.all(response[0].map(async (e: any) => ({
          id: e.id,
          name: e.name,
          description: e.description.substring(0, 120),
          price: e.price,
          promotionPrice: e.promotionPrice,
          slug: e.slug,
          productTags: e.productTags,
          productCategory: e.productCategory,
          productImages: e.productImages,
          storage: e.storage,
          image: await this.s3Service.getSigned(e.storage.image)
        }))),
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  async findOne(slug: string) {
    try {
      const entity = await this.productRepository.findOne({ where: { slug } });
      if (!entity) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.UNSUCCESS')
        };
      }
      return { 
        status: CORRECT, 
        data: {
          ...entity,
          image: await this.s3Service.getSigned(entity.storage.image)
        }
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  @Transactional()
  async update(product: Product, updateProductDto: UpdateProductDto) {
    try {
      const { removeImages, selectedDates, type, category, status, tags, image, attributes, ...others } = updateProductDto;
      let params: any = others;
      if (Array.isArray(selectedDates) && selectedDates.length === 2) {
        params.starttime = selectedDates[0]
        params.endtime = selectedDates[1]
      }
      const commonData = await this.commonRepository.findBy([
        { group: PRODUCT_STATUS.GROUP, type: status },
        { group: PRODUCT_TYPE.GROUP, type: type }
      ]);
      const { id: categoryId } = await this.productCategoryRepository.findOne({
        relations: { group: true },
        where: { type: category, group: { type: CATEGORY.PRODUCT } }
      });

      const response = await this.productRepository.update(
        product.id, 
        { 
          ...others,
          typeId: commonData.find((d: any) => d.type === type && d.group === PRODUCT_TYPE.GROUP).id,
          statusId: commonData.find((d: any) => d.type === status && d.group === PRODUCT_STATUS.GROUP).id,
          categoryId
        }
      );
      if (response.affected > 0) {
        const lastTags = product.productTags.map((p: any) => p.type);      
        const removeTags = arrayDifference(lastTags, tags);
        if (Array.isArray(removeTags) && removeTags.length > 0) {
          const fetchProductProductTag = this.dataSource.createQueryBuilder()
            .select('product_product_tag.id')
            .from(ProductProductTag, 'product_product_tag')
            .innerJoin(ProductTag, 'product_tag', 'product_tag.id = product_product_tag.product_tag_id')
            .where(`"product_product_tag"."product_id" = :productId`, { productId: product.id })
            .andWhere('"product_tag"."type" IN (:...type)', { type: removeTags })
          await queryBuilderProcess(fetchProductProductTag, async (data: any) => {
            await this.productProductTagRepository.delete(data.map((d: any) => d.product_product_tag_id));
          });
        }
        const insertTags = arrayDifference(tags, lastTags);
        if (Array.isArray(insertTags) && insertTags.length > 0) {
          const fetchProductTags = this.dataSource.createQueryBuilder()
            .select('product_tag.id')
            .from(ProductTag, 'product_tag')
            .innerJoin(TagGroup, 'tag_group', 'tag_group.id = product_tag.group_id')
            .where('"product_tag"."type" IN (:...type)', { type: insertTags })
            .andWhere('"tag_group"."type" = :group', { group: TAG.NEWS })
          await queryBuilderProcess(fetchProductTags, async (data: any) => {
            await this.productProductTagRepository.insert(data.map((d: any) => ({
              productId: product.id,
              productTagId: d.product_tag_id
            })));
          });
        }

        if (image) {
          const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
            where: {
              type: MEDIA_STATUS.ASSIGN,
              group: MEDIA_STATUS.GROUP
            }
          })
          await this.productImageRepository.update(image, { statusId: mediaStatusId });
          await this.productProductImageRepository.insert({
            productImageId: image,
            productId: product.id,
          });
        }

        if (removeImages) {
          await this.productImageRepository.softDelete({id: In(removeImages)});
          await this.productProductImageRepository.delete({
            productImageId: In(removeImages),
            productId: product.id,
          });
        }
        
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
  async remove(product: Product) {
    try {
      await this.productProductTagRepository.softDelete({ productId: product.id });
      await this.productProductImageRepository.softDelete({ productId: product.id });
      await this.productImageRepository.softDelete({ id: In(product.productImages.map((i: any) => i.id)) });
      const response = await this.productRepository.softDelete(product.id);
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
  async importProduct(data: any) {
    try {
      const commonData = await this.commonRepository.findBy([
        { group: PRODUCT_STATUS.GROUP, type: PRODUCT_STATUS.ACTIVED },
        { group: PRODUCT_TYPE.GROUP, type: PRODUCT_TYPE.MANUAL },
        { group: TAG.GROUP, type: TAG.PRODUCT }
      ]);
      const { id: categoryId } = await this.productCategoryRepository.findOne({
        relations: { group: true },
        where: { group: { type: CATEGORY.PRODUCT } }
      });
      const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
        where: {
          type: MEDIA_STATUS.ASSIGN,
          group: MEDIA_STATUS.GROUP
        }
      })

      const importTagList = data.map((e: any) => e.tags)
      let tagData = await this.productTagRepository.findBy([
        { group: { type: TAG.PRODUCT }, type: In(importTagList) },
      ]);
      if (tagData.length < importTagList.length) {
        for (const importTag of importTagList) {
          const existedTag = await this.productTagRepository.findOne({
            relations: { group: true },
            where: { group: { type: TAG.PRODUCT }, type: importTag }
          })
          if (!existedTag) {
            await this.productTagRepository.insert({
              groupId: commonData.find((d: any) => d.type === TAG.PRODUCT && d.group === TAG.GROUP).id,
              type: importTag,
              typeName: JSON.stringify({ vi: importTag, en: importTag }),
            })
          }
        }
      }
      tagData = await this.productTagRepository.findBy({ group: { type: TAG.PRODUCT }, type: In(importTagList) });

      for (const item of data) {
        const productResults = await this.productRepository.insert({
          name: item.name, 
          slug: slugGenerator(item.name),
          price: item.price,
          promotionPrice: item.price,
          description: item.description, 
          typeId: commonData.find((d: any) => d.type === PRODUCT_TYPE.MANUAL && d.group === PRODUCT_TYPE.GROUP).id,
          statusId: commonData.find((d: any) => d.type === PRODUCT_STATUS.ACTIVED && d.group === PRODUCT_STATUS.GROUP).id,
          categoryId
        })
        if (Array.isArray(productResults.identifiers) && productResults.identifiers.length > 0) {
          const mediaResults = await this.productImageRepository.insert({
            name: item.name,
            url: item.secure_url,
            alt: item.name,
            statusId: mediaStatusId
          });
          if (Array.isArray(mediaResults.identifiers) && mediaResults.identifiers.length > 0) {
            await this.productProductImageRepository.insert({
              productImageId: mediaResults.identifiers[0].id,
              productId: productResults.identifiers[0].id,
            });
          }

          await this.productProductTagRepository.insert({
            productTagId: tagData.find((d: any) => d.type === item.tags).id,
            productId: productResults.identifiers[0].id,
          });
        }
      }

      return [CORRECT]
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return [CORRECT]
    }
  }
}
