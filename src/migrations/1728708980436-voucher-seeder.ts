import * as path from "path";
import { VOUCHER_CONDITION, VOUCHER_STATUS, VOUCHER_TYPE } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { Voucher } from "src/modules/voucher/entities/voucher.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class VoucherSeeder1728708980436 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const vouchers: Array<any> = await readJSONFile(path.join(__dirname, './data/voucher.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type, \"group\"")
      .from(Common, "common")
      .where(
        `"common"."group" IN (:...group)`, 
        { group: [VOUCHER_TYPE.GROUP, VOUCHER_CONDITION.GROUP, VOUCHER_STATUS.GROUP] }
      )
      .execute();
    const insertValues = vouchers.map((g: any) => {
      const { conditionType, type, status, ...others } = g;
      return {
        ...others,
        statusId: commonData.find((c: any) => c.type === status && c.group === VOUCHER_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === VOUCHER_TYPE.GROUP)?.id,
        conditionTypeId: commonData.find((c: any) => c.type === conditionType && c.group === VOUCHER_CONDITION.GROUP)?.id,
      }
    })
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Voucher)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const vouchers: Array<any> = await readJSONFile(path.join(__dirname, './data/voucher.json'));
    await sliceIntoChunks(vouchers, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Voucher, "voucher")
          .where(`"voucher"."code" IN (:...code)`, { code: cur.map((c: any) => c.code) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
