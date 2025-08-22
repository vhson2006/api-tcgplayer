import * as path from "path";
import { Media } from "src/modules/media/entities/media.entity";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { MigrationInterface, QueryRunner } from "typeorm"
import { Common } from "src/modules/common/entities/common.entity";
import { MEDIA_STATUS } from "src/assets/configs/app.common";
import { MAX_SIZE } from "src/assets/configs/app.constant";

export class MediaSeeder1725685002311 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const statusData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\"")
      .from(Common, "common")
      .where(
        `"common"."type" = :type AND "common"."group" = :group`, 
        { type: MEDIA_STATUS.ASSIGN, group: MEDIA_STATUS.GROUP }
      )
      .execute();

    const medias = await readJSONFile(path.join(__dirname, './data/media.json'));
    await sliceIntoChunks(medias.map((m: any) => ({...m, statusId: statusData[0].id })), MAX_SIZE)
      .reduce(async (pre: any, cur: any) => {
        await queryRunner.connection
          .createQueryBuilder()
          .insert()
          .into(Media)
          .values(cur)
          .execute();
        return pre;
      }, []);
  }
    
  public async down(queryRunner: QueryRunner): Promise<void> {
    const medias = await readJSONFile(path.join(__dirname, './data/media.json'));
    await sliceIntoChunks(medias, MAX_SIZE)
      .reduce(async (pre: any, cur: any) => {
        try {
          await queryRunner.connection.createQueryBuilder()
            .delete()
            .from(Media, "media")
            .where(`"media"."name" IN (:...name)`, { name: cur.map((e: any) => e.name) })
            .execute();
        } catch (e) {console.log(e)}
        return pre;
      }, []);
  }
}
