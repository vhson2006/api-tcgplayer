import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Transactional } from 'typeorm-transactional';
import { News } from './entities/news.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CORRECT, DEFAULT_PAGE, DEFAULT_SIZE, INCORRECT, MAX_SIZE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { DataSource, In, Like, Repository } from 'typeorm';
import { NewsQueryDto } from './dto/query-news.dto';
import { NewsCategory } from './entities/news-category.entity';
import { CATEGORY, MEDIA_STATUS, TAG } from 'src/assets/configs/app.common';
import { NewsTag } from './entities/news-tag.entity';
import { NewsNewsTag } from './entities/news-news-tag.entity';
import { arrayDifference } from 'src/assets/utils/array';
import { queryBuilderProcess } from 'src/assets/utils/query';
import { TagGroup } from 'src/modules/tag/entities/tag-group.entity';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';
import { NewsImage } from './entities/news-image.entity';
import { slugGenerator } from 'src/assets/utils/code';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class NewsService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsCategory) private readonly newsCategoryRepository: Repository<NewsCategory>,
    @InjectRepository(NewsTag) private readonly newsTagRepository: Repository<NewsTag>,
    @InjectRepository(NewsNewsTag) private readonly newsNewsTagRepository: Repository<NewsNewsTag>,
    @InjectRepository(MediaStatus) private readonly mediaStatusRepository: Repository<MediaStatus>,
    @InjectRepository(NewsImage) private readonly newsImageRepository: Repository<NewsImage>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createNewsDto: CreateNewsDto) {
    try {
      const { image, category, tags, title, predefine, content, ...params } = createNewsDto
      const { id: categoryId } = await this.newsCategoryRepository.findOne({
        relations: { group: true },
        where: { 
          type: category, 
          group: { type: CATEGORY.NEWS }
        },
      });
      
      if (image) {
        const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
          where: {
            type: MEDIA_STATUS.ASSIGN,
            group: MEDIA_STATUS.GROUP
          }
        })
        await this.newsImageRepository.update(image, { statusId: mediaStatusId });
      }

      const { identifiers } = await this.newsRepository.insert({
        ...params,
        slug: slugGenerator(title),
        title: JSON.stringify({ en: title, vi: title }),
        predefine: JSON.stringify({ en: predefine, vi: predefine }),
        content: JSON.stringify({ en: content, vi: content }),
        categoryId,
        imageId: image
      });
      if (Array.isArray(identifiers) && identifiers.length > 0) {
        if (tags) {
          const tagData = await this.newsTagRepository.find({
            relations: { group: true },
            where: { 
              type: In(tags),
              group: { type: TAG.NEWS }
            },
          });
          await this.newsNewsTagRepository.insert(
            tagData.map((v: any) => ({
              newsTagId: v.id,
              newsId: identifiers[0].id,
            }))
          );
        }
        
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

  async findAll(query: NewsQueryDto) {
    try {
      const { category, search, page, size } = query;
      let queryObj: any = {
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (category) {
        const { id: categoryId } = await this.newsCategoryRepository.findOne({
          relations: { group: true },
          where: { type: category, group: { type: CATEGORY.NEWS } }
        });
        if (search) {
          queryObj = {
            ...queryObj, 
            where: [
              { slug: Like(`%${search}%`), categoryId },
              { predefine: Like(`%${search}%`), categoryId },
              { title: Like(`%${search}%`), categoryId },
              { content: Like(`%${search}%`), categoryId },
              { author: Like(`%${search}%`), categoryId },
            ],
          }
        } else {
          queryObj = {
            ...queryObj, 
            where: {categoryId},
          }
        }
      } else {
        if (search) {
          queryObj = {
            ...queryObj, 
            where: [
              { slug: Like(`%${search}%`) },
              { predefine: Like(`%${search}%`) },
              { title: Like(`%${search}%`) },
              { content: Like(`%${search}%`) },
              { author: Like(`%${search}%`) },
            ],
          }
        }
      }
      
      const response = await this.newsRepository.findAndCount(queryObj);
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  async findOne(slug: string) {
    try {
      const entity = await this.newsRepository.findOne({ where: { slug } });
      if (!entity) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.UNSUCCESS')
        };
      }
      return { 
        status: CORRECT, 
        data: entity
      };;
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  @Transactional()
  async update(news: News, updateNewsDto: UpdateNewsDto) {
    try {
      const { image, tags, category, lang, title, predefine, content, ...other } = updateNewsDto
      let newTitle = JSON.parse(news.title);
      newTitle[lang] = title;
      let newPredefine = JSON.parse(news.predefine);
      newPredefine[lang] = predefine;
      let newContent = JSON.parse(news.content);
      newContent[lang] = content;

      const lastTags = news.newsTags.map((p: any) => p.type);      
      const removeTags = arrayDifference(lastTags, tags);
      if (Array.isArray(removeTags) && removeTags.length > 0) {
        const fetchNewsNewsTag = this.dataSource.createQueryBuilder()
          .select('news_news_tag.id')
          .from(NewsNewsTag, 'news_news_tag')
          .innerJoin(NewsTag, 'news_tag', 'news_tag.id = news_news_tag.news_tag_id')
          .where(`"news_news_tag"."news_id" = :newsId`, { newsId: news.id })
          .andWhere('"news_tag"."type" IN (:...type)', { type: removeTags })
        await queryBuilderProcess(fetchNewsNewsTag, async (data: any) => {
          await this.newsNewsTagRepository.delete(data.map((d: any) => d.news_news_tag_id));
        });
      }

      const insertTags = arrayDifference(tags, lastTags);
      if (Array.isArray(insertTags) && insertTags.length > 0) {
        const fetchNewsTags = this.dataSource.createQueryBuilder()
          .select('news_tag.id')
          .from(NewsTag, 'news_tag')
          .innerJoin(TagGroup, 'tag_group', 'tag_group.id = news_tag.group_id')
          .where('"news_tag"."type" IN (:...type)', { type: insertTags })
          .andWhere('"tag_group"."type" = :group', { group: TAG.NEWS })
        await queryBuilderProcess(fetchNewsTags, async (data: any) => {
          await this.newsNewsTagRepository.insert(data.map((d: any) => ({
            newsId: news.id,
            newsTagId: d.news_tag_id
          })));
        });
      }

      const { id: categoryId } = await this.newsCategoryRepository.findOne({
        relations: { group: true },
        where: { 
          type: category, 
          group: { type: CATEGORY.NEWS }
        },
      });

      if (image) {
        await this.newsImageRepository.softDelete(news.imageId);
        const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
          where: {
            type: MEDIA_STATUS.ASSIGN,
            group: MEDIA_STATUS.GROUP
          }
        })
        await this.newsImageRepository.update(image, { statusId: mediaStatusId });
      }

      const response = await this.newsRepository.update(
        news.id, { 
          ...other,
          categoryId,
          title: newTitle,
          predefine: newPredefine,
          content: newContent,
          imageId: image
        });
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
  async remove(news: News) {
    try {
      await this.newsImageRepository.softDelete(news.imageId);
      await this.newsNewsTagRepository.softDelete({ newsId: news.id });
      const response = await this.newsRepository.softDelete(news.id);
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
