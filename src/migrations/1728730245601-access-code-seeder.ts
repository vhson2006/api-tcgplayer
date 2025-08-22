import * as path from "path";
import { AccessCode } from "src/modules/access-code/entities/access-code.entity";
import { ACCESS_CODE_STATUS, ACCESS_CODE_TYPE } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AccessCodeSeeder1728730245601 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const accessCodes: Array<any> = await readJSONFile(path.join(__dirname, './data/access-code.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type, \"group\"")
      .from(Common, "common")
      .where(
        `"common"."group" IN (:...group)`, 
        { group: [ACCESS_CODE_STATUS.GROUP, ACCESS_CODE_TYPE.GROUP] }
      )
      .execute();
    const insertValues = accessCodes.map((g: any) => {
      const { type, status, ...others } = g;

      return {
        ...others,
        statusId: commonData.find((c: any) => c.type === status && c.group === ACCESS_CODE_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === ACCESS_CODE_TYPE.GROUP)?.id,
      }
    })
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(AccessCode)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const accessCodes: Array<any> = await readJSONFile(path.join(__dirname, './data/access-code.json'));
    await sliceIntoChunks(accessCodes, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(AccessCode, "access_code")
          .where(`"access_code"."code" IN (:...code)`, { code: cur.map((c: any) => c.code) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
