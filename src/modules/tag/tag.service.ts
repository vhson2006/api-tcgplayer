import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE, CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { DataSource, Like, Not, Repository } from 'typeorm';
import { TagQueryDto } from './dto/query-tag.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Tag } from './entities/tag.entity';
import { Transactional } from 'typeorm-transactional';
import { TagGroup } from './entities/tag-group.entity';
import { NewsNewsTag } from 'src/modules/news/entities/news-news-tag.entity';
import { ProductProductTag } from 'src/modules/product/entities/product-product-tag.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class TagService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TagGroup) private readonly tagGroupRepository: Repository<TagGroup>,
    @InjectRepository(NewsNewsTag) private readonly newsNewsTagRepository: Repository<NewsNewsTag>,
    @InjectRepository(ProductProductTag) private readonly productProductTagRepository: Repository<ProductProductTag>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createTagDto: CreateTagDto) {
    try {
      const { type, name, group } = createTagDto;
      const { id: groupId } = await this.tagGroupRepository.findOneBy({ type: group });
      const uniqueCheck = await this.tagRepository.findOne({
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
      const { identifiers } = await this.tagRepository.insert({
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

  async findAll(query: TagQueryDto) {
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
      
      const response = await this.tagRepository.findAndCount(queryObj);
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
  async update(tag: Tag, updateTagDto: UpdateTagDto) {
    try {
      const { type, name, group, lang } = updateTagDto;
      const { id: groupId } = await this.tagGroupRepository.findOneBy({ type: group });
      const uniqueCheck = await this.tagRepository.findOne({
        where: {
          type: type,
          groupId: groupId, 
          id: Not(tag.id)
        }
      })
      console.log(updateTagDto)
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      let newName = JSON.parse(tag.typeName);
      newName[lang] = name;
      const response = await this.tagRepository.update(
        tag.id, 
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
  async remove(tag: Tag) {
    try {
      await this.newsNewsTagRepository.softDelete({ newsTagId: tag.id });
      await this.productProductTagRepository.softDelete({ productTagId: tag.id });
      const updateResponse = await this.tagRepository.update(
        tag.id, 
        { type: `${tag.type}-${tag.id}` }
      );
      
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }

      const response = await this.tagRepository.softDelete(tag.id);
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
