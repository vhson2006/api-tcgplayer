import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { Tag } from './entities/tag.entity';
import { TagGroup } from './entities/tag-group.entity';
import { NewsTag } from 'src/modules/news/entities/news-tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { NewsNewsTag } from 'src/modules/news/entities/news-news-tag.entity';
import { ProductProductTag } from 'src/modules/product/entities/product-product-tag.entity';
import { PublicTagController } from './public-tag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsNewsTag,
      NewsTag, Tag, TagGroup,
      ProductProductTag
    ])
  ],
  controllers: [TagController, PublicTagController],
  providers: [TagService, I18nService],
})
export class TagModule {}
