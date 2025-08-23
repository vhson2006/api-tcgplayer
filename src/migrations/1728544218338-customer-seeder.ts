import * as path from "path";
import * as dotenv from "dotenv";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile } from "src/assets/utils/file";
import { Customer } from "src/modules/customer/entities/customer.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { hash, genSalt } from "bcrypt";
import { CUSTOMER_TYPE } from "src/assets/configs/app.common";
import { Common } from "src/modules/common/entities/common.entity";
import { MAX_SIZE } from "src/assets/configs/app.constant";

dotenv.config();

export class CustomerSeeder1728544218338 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const customers: Array<any> = await readJSONFile(path.join(__dirname, './data/customer.json'));
    const typeData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(
        `"common"."type" IN (:...type) AND "common"."group" = :group`, 
        { type: customers.map((e: any) => e.type), group: CUSTOMER_TYPE.GROUP }
      )
      .execute();
    const insertValues = await Promise.all(customers.map(async (e: any) => {
      const { type, ...customerData } = e;
      return {
        ...customerData,
        password: await hash(process.env.DEFAULT_PASSWORD, await genSalt()),
        typeId: typeData.find((d: any) => d.type === type).id,
      }
    }))

    await sliceIntoChunks(insertValues, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Customer)
        .values(cur)
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const customers: Array<any> = await readJSONFile(path.join(__dirname, './data/customer.json'));
    await sliceIntoChunks(customers, MAX_SIZE).reduce(async (pre: any, cur: any) => {
      try {
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Customer, "customer")
          .where(`"customer"."phone" IN (:...phone)`, { phone: cur.map((c: any) => c.phone) })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
