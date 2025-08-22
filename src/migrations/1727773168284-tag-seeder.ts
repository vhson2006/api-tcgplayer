import * as path from "path";
import { TAG } from "src/assets/configs/app.common";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Tag } from "src/modules/tag/entities/tag.entity";
import { Common } from "src/modules/common/entities/common.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { MAX_SIZE } from "src/assets/configs/app.constant";

export class TagSeeder1727773168284 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tagGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: TAG.GROUP })
      .execute();

    const tags: Array<any> = await readJSONFile(path.join(__dirname, './data/tag.json'));
    await sliceIntoChunks(tags, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Tag)
        .values(cur.map((d: any) => {
          const { group, ...tagData } = d;
          return {
            ...tagData,
            groupId: tagGroupData.find((d: any) => d.type === group).id,
          }
        }))
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tags: Array<any> = await readJSONFile(path.join(__dirname, './data/tag.json'));
    await sliceIntoChunks(tags, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Tag, "tag")
          .where(`"tag"."type" IN (:...type)`, { type: cur.map((c: any) => c.type) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
