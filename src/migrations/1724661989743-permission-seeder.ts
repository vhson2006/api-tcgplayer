import * as path from "path";
import { Permission } from "src/modules/role/entities/permission.entity";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { MigrationInterface, QueryRunner } from "typeorm"
import { MAX_SIZE } from "src/assets/configs/app.constant";

type PermissionSeed = {
  group: string;
  type: string;
  groupName: string;
  typeName: string;
}

export class PermissionSeeder1724661989743 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = await readJSONFile(path.join(__dirname, './data/permission.json'));
    await sliceIntoChunks(permissions, MAX_SIZE)
      .reduce(async (pre: any, permission: any) => {
        await queryRunner.connection.createQueryBuilder()
          .insert()
          .into(Permission)
          .values(permission)
          .execute();
        return pre;
      }, []);
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    const permissions = await readJSONFile(path.join(__dirname, './data/permission.json'));
    await sliceIntoChunks(permissions, MAX_SIZE)
      .reduce(async (pre: any, permission: any) => {
        try {
          await queryRunner.connection.createQueryBuilder()
            .delete()
            .from(Permission, "permission")
            .where(
              "\"permission\".\"type\" IN (:...types)", 
              { types: permission.map((permission: PermissionSeed) => permission.type )}
            )
            .execute();
        } catch (e) {console.log(e)}
        return pre;
      }, []);
  }
}
