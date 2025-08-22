import * as path from "path";
import { COMMENT_STATUS, COMMENT_TOPIC } from "src/assets/configs/app.common";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { MAX_SIZE } from "src/assets/configs/app.constant";

export class CommentSeeder1728727400788 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const comments: Array<any> = await readJSONFile(path.join(__dirname, './data/comment.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type, \"group\"")
      .from(Common, "common")
      .where(
        `"common"."group" IN (:...group)`, 
        { group: [COMMENT_STATUS.GROUP, COMMENT_TOPIC.GROUP] }
      )
      .execute();
    const insertValues = comments.map((g: any) => {
      const { type, status, post, ...others } = g;

      return {
        ...others,
        statusId: commonData.find((c: any) => c.type === status && c.group === COMMENT_STATUS.GROUP)?.id,
        typeId: commonData.find((c: any) => c.type === type && c.group === COMMENT_TOPIC.GROUP)?.id,
        postSlug: post
      }
    })
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Comment)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const comments: Array<any> = await readJSONFile(path.join(__dirname, './data/comment.json'));
    await sliceIntoChunks(comments, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Comment, "comment")
          .where(`"comment"."name" IN (:...name)`, { name: cur.map((c: any) => c.name) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
