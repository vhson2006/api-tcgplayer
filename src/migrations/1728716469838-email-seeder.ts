import * as path from "path";
import { EMAIL_STATUS, EMAIL_TYPE } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { Email } from "src/modules/email/entities/email.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailSeeder1728716469838 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const emails: Array<any> = await readJSONFile(path.join(__dirname, './data/email.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type, \"group\"")
      .from(Common, "common")
      .where(
        `"common"."group" IN (:...group)`, 
        { group: [EMAIL_STATUS.GROUP, EMAIL_TYPE.GROUP] }
      )
      .execute();
    const insertValues = emails.map((g: any) => {
      const { type, status, ...others } = g;
      return {
        ...others,
        statusId: commonData.find((c: any) => c.type === status && c.group === EMAIL_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === EMAIL_TYPE.GROUP)?.id,
      }
    })
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Email)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const emails: Array<any> = await readJSONFile(path.join(__dirname, './data/email.json'));
    await sliceIntoChunks(emails, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Email, "email")
          .where(`"email"."title" IN (:...title)`, { title: cur.map((c: any) => c.title) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
