import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/query-category.dto';
import { DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE, CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { DataSource, Like, Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Transactional } from 'typeorm-transactional';
import { CategoryGroup } from './entities/category-group.entity';
import { News } from 'src/modules/news/entities/news.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class CategoryService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryGroup) private readonly categoryGroupRepository: Repository<CategoryGroup>,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { type, name, group } = createCategoryDto;
      const { id: groupId } = await this.categoryGroupRepository.findOneBy({ type: group });
      const uniqueCheck = await this.categoryRepository.findOne({
        where: {
          type: type,
          groupId: groupId
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }

      const { identifiers } = await this.categoryRepository.insert({
        type,
        typeName: JSON.stringify({ vi: name, en: name }),
        groupId: groupId
      });
      if (Array.isArray(identifiers) && identifiers.length > 0) {
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

  async findAll(query: CategoryQueryDto) {
    try {
      const { group, search, page, size } = query;
      let queryObj: any = {
        relations: { group: true },
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (search) {
        queryObj = {
          ...queryObj, 
          where: [
            { type: Like(`%${search}%`) },
            { type_name: Like(`%${search}%`) },
            { group: [
              { type: Like(`%${search}%`) },
              { type_name: Like(`%${search}%`) },
            ] }
          ],
        }
      }
      if (group) {
        queryObj = {
          ...queryObj, 
          where: { ...queryObj.where, group: { type: group }},
        }
      }
      
      const response = await this.categoryRepository.findAndCount(queryObj);
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  @Transactional()
  async update(category: Category, updateCategoryDto: UpdateCategoryDto) {
    try {
      const { type, name, group, lang } = updateCategoryDto;
      const { id: groupId } = await this.categoryGroupRepository.findOneBy({ type: group });
      const uniqueCheck = await this.categoryRepository.findOne({
        where: {
          type: type,
          groupId: groupId, 
          id: Not(category.id)
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      let newName = JSON.parse(category.typeName);
      newName[lang] = name;
      const response = await this.categoryRepository.update(
        category.id, 
        {
          type,
          typeName: JSON.stringify(newName),
          groupId: groupId
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
  async remove(category: Category) {
    try {
      const updateResponse = await this.categoryRepository.update(
        category.id, 
        { type: `${category.type}-${category.id}` }
      );
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }
      await this.newsRepository.update({ categoryId: category.id }, { categoryId: null });
      await this.productRepository.update({ categoryId: category.id }, { categoryId: null });
      const response = await this.categoryRepository.softDelete(category.id);
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
