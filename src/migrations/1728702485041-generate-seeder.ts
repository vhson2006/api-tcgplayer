import * as path from "path";
import { GENERATE_STATUS } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { Generate } from "src/modules/generate/entities/generate.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateSeeder1728702485041 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const generates: Array<any> = await readJSONFile(path.join(__dirname, './data/generate.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(`"common"."group" IN (:...group)`, { group: [GENERATE_STATUS.GROUP] })
      .execute();
    const insertValues = generates.map((g: any) => {
      const { status, ...others } = g;
      return {
        ...others,
        statusId: commonData.find((c: any) => c.type === status)?.id
      }
    })
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Generate)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const generates: Array<any> = await readJSONFile(path.join(__dirname, './data/generate.json'));
    await sliceIntoChunks(generates, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Generate, "generate")
          .where(`"generate"."command" IN (:...command)`, { command: cur.map((c: any) => c.command) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
