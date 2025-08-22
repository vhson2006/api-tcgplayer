import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { News } from './entities/news.entity';
import { NewsTag } from './entities/news-tag.entity';
import { NewsCategory } from './entities/news-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from 'src/modules/category/entities/category-group.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Tag } from 'src/modules/tag/entities/tag.entity';
import { TagGroup } from 'src/modules/tag/entities/tag-group.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { NewsNewsTag } from './entities/news-news-tag.entity';
import { PublicNewsController } from './public-news.controller';
import { NewsImage } from './entities/news-image.entity';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News, NewsImage, MediaStatus, 
      NewsTag, Tag, TagGroup, NewsNewsTag,
      NewsCategory, Category, CategoryGroup
    ])
  ],
  controllers: [NewsController, PublicNewsController],
  providers: [NewsService, I18nService],
})
export class NewsModule {}
