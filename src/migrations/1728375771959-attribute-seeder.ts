import * as path from "path";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Attribute } from "src/modules/product/entities/attribute.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AttributeSeeder1728375771959 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const attributes: Array<any> = await readJSONFile(path.join(__dirname, './data/attribute.json'));
    await sliceIntoChunks(attributes, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Attribute)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const attributes: Array<any> = await readJSONFile(path.join(__dirname, './data/attribute.json'));
    await sliceIntoChunks(attributes, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Attribute, "attribute")
          .where(`"attribute"."type" IN (:...type)`, { type: cur.map((c: any) => c.type) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
