import * as path from "path";
import { CATEGORY, TAG } from "src/assets/configs/app.common";
import { readJSONFile } from "src/assets/utils/file";
import { Category } from "src/modules/category/entities/category.entity";
import { Common } from "src/modules/common/entities/common.entity";
import { Media } from "src/modules/media/entities/media.entity";
import { NewsNewsTag } from "src/modules/news/entities/news-news-tag.entity";
import { News } from "src/modules/news/entities/news.entity";
import { Tag } from "src/modules/tag/entities/tag.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class NewsSeeder1727773174374 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const news: Array<any> = await readJSONFile(path.join(__dirname, './data/news.json'));
    const categoryGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\"")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: CATEGORY.GROUP })
      .execute();

    const newsCategoryData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Category, "category")
      .where(
        `"category"."type" IN (:...type) AND "category"."group_id" IN (:...groupId)`, 
        { type: news.map((e: any) => e.category), groupId: categoryGroupData.map((d: any) => d.id) }
      )
      .execute();

    const tagGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\"")
      .from(Common, "common")
      .where(
        `"common"."type" = :type AND "common"."group" = :group`, 
        { type: TAG.NEWS, group: TAG.GROUP }
      )
      .execute();
    
    const newsTagData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Tag, "tag")
      .where(
        `"tag"."type" IN (:...types) AND "tag"."group_id" IN (:...groupId)`, 
        { 
          types: news.reduce((pre: any, cur: any) => [...pre, ...cur.tags], []), 
          groupId: tagGroupData.map((d: any) => d.id) 
        }
      )
      .execute();

    const mediaData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", name")
      .from(Media, "media")
      .where(`"media"."name" IN (:...names)`, { names: news.map((e: any) => e.image ) })
      .execute();

    await news.reduce(async (pre: any, cur: any) => {
      const { image, category, tags, ...newsData } = cur;
      const { identifiers } = await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(News)
        .values({
          ...newsData,
          imageId: mediaData.find((d: any) => d.name === image).id,
          categoryId: newsCategoryData.find((d: any) => d.type === category).id,
        })
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(NewsNewsTag)
        .values(tags.map((t: any) => ({
          newsTagId: newsTagData.find((d: any) => d.type === t).id,
          newsId: identifiers[0].id
        })))
        .execute();
      return pre;
    }, []);
    
  }
    
  public async down(queryRunner: QueryRunner): Promise<void> {
    const news = await readJSONFile(path.join(__dirname, './data/news.json'));
    await news.reduce(async (pre: any, cur: any) => {
      try {
        const newsItem = await queryRunner.manager.createQueryBuilder()
          .select("\"id\", slug")
          .from(News, "news")
          .where(`"news"."slug" = :slug`, { slug: cur.slug })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(NewsNewsTag, "news_news_tag")
          .where(`"news_news_tag"."news_id" = :newsId`, { newsId: newsItem[0].id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(News, "news")
          .where(`"news"."slug" = :slug`, { slug: cur.slug })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
