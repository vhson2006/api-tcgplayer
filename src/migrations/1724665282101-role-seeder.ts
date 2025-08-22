import * as path from "path";
import { RolePermission } from "src/modules/role/entities/role-permission.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { readJSONFile } from "src/assets/utils/file";
import { Permission } from "src/modules/role/entities/permission.entity";
import { MigrationInterface, QueryRunner } from "typeorm"

export class RoleSeeder1724665219101 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissionData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", concat(\"group\", '.', \"type\") AS full_permission")
      .from(Permission, "permission")
      .execute();
    const roles = await readJSONFile(path.join(__dirname, './data/role.json'));
    await roles.reduce(async (pre: any, role: any) => {
      const { permissions, ...roleData } = role;
      const { identifiers } = await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Role)
        .values(roleData)
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values(permissions.map((p: any) => ({
          roleId: identifiers[0].id,
          permissionId: permissionData.find((v: any) => v.full_permission === p)?.id
        })))
        .execute();
      return pre;
    }, []);
  }
    
  public async down(queryRunner: QueryRunner): Promise<void> {
    const roles = await readJSONFile(path.join(__dirname, './data/role.json'));
    await roles.reduce(async (pre: any, role: any) => {
      try {
        const roleData = await queryRunner.manager.createQueryBuilder()
          .select("\"id\"")
          .from(Role, "role")
          .where(`"role"."type" = :type`, { type: role.type })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(RolePermission, "role_permission")
          .where(`"role_permission"."role_id" = :RoleId`, { RoleId: roleData[0].id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Role, "role")
          .where(`"role"."type" = :type`, { type: role.type })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }
}
