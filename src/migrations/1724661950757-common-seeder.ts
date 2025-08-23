import * as path from "path";
import { Common } from "src/modules/common/entities/common.entity";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { MigrationInterface, QueryRunner } from "typeorm"
import { MAX_SIZE } from "src/assets/configs/app.constant";

type CommonSeed = {
  group: string;
  type: string;
  groupName: string;
  typeName: string;
}

export class CommonSeeder1724661950757 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const commons = await readJSONFile(path.join(__dirname, './data/common.json'));
    await sliceIntoChunks(commons, MAX_SIZE)
      .reduce(async (pre: any, cur: any) => {
        await queryRunner.connection.createQueryBuilder()
          .insert()
          .into(Common)
          .values(cur)
          .execute();
        return pre;
      }, []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const commons = await readJSONFile(path.join(__dirname, './data/common.json'));
    await sliceIntoChunks(commons, MAX_SIZE)
      .reduce(async (pre: any, cur: any) => {
        try {
          await queryRunner.connection.createQueryBuilder()
            .delete()
            .from(Common, "common")
            .where(
              "\"common\".\"type\" IN (:...types)", 
              { types: cur.map((common: CommonSeed) => common.type )}
            )
            .execute();
        } catch (e) {console.log(e)}
        return pre;
      }, []);
  }
}
