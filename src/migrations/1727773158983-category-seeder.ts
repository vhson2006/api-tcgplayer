import * as path from "path";
import { CATEGORY } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Category } from "src/modules/category/entities/category.entity";
import { Common } from "src/modules/common/entities/common.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CategorySeeder1727773158983 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoryGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: CATEGORY.GROUP })
      .execute();

    const categories: Array<any> = await readJSONFile(path.join(__dirname, './data/category.json'));
    await sliceIntoChunks(categories, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Category)
        .values(cur.map((d: any) => {
          const { group, ...categoryData } = d;
          return {
            ...categoryData,
            groupId: categoryGroupData.find((d: any) => d.type === group).id,
          }
        }))
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const categories: Array<any> = await readJSONFile(path.join(__dirname, './data/category.json'));
    await sliceIntoChunks(categories, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Category, "category")
          .where(`"category"."type" IN (:...type)`, { type: cur.map((c: any) => c.type) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }
}
