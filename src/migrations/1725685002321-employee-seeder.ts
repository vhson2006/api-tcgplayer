import * as path from "path";
import * as dotenv from "dotenv";
import { MigrationInterface, QueryRunner } from "typeorm"
import { Role } from "src/modules/role/entities/role.entity";
import { Employee } from "src/modules/employee/entities/employee.entity";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { EMPLOYEE_STATUS } from "src/assets/configs/app.common";
import { sliceIntoChunks } from "src/assets/utils/array";
import { Media } from "src/modules/media/entities/media.entity";
import { hash, genSalt } from "bcrypt";
import { MAX_SIZE } from "src/assets/configs/app.constant";

dotenv.config();

export class EmployeeSeeder1725685002321 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const employees = await readJSONFile(path.join(__dirname, './data/employee.json'));
    const statusData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(
        `"common"."type" IN (:...type) AND "common"."group" = :group`, 
        { type: employees.map((e: any) => e.status), group: EMPLOYEE_STATUS.GROUP }
      )
      .execute();
    
    const roleData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Role, "role")
      .where(`"role"."type" IN (:...types)`, { types: employees.map((e: any) => e.role ) })
      .execute();

    const mediaData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", name")
      .from(Media, "media")
      .where(`"media"."name" IN (:...names)`, { names: employees.map((e: any) => e.avatar ) })
      .execute();

    const insertValues = await Promise.all(employees.map(async (e: any) => {
      const { role, status, avatar, password, ...employeeData } = e;
      return {
        ...employeeData,
        password: await hash(process.env.DEFAULT_PASSWORD, await genSalt()),
        avatarId: mediaData.find((d: any) => d.name === avatar).id,
        statusId: statusData.find((d: any) => d.type === status).id,
        roleId: roleData.find((d: any) => d.type === role).id
      }
    }))
    
    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Employee)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }
    
  public async down(queryRunner: QueryRunner): Promise<void> {
    const employees = await readJSONFile(path.join(__dirname, './data/employee.json'));
    await sliceIntoChunks(employees, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Employee, "employee")
          .where(`"employee"."phone" IN (:...phone)`, { phone: cur.map((e: any) => e.phone) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, [])
  }
}
