import * as  path from "path";
import { PAYMENT_TYPE, PAYMENT_STATUS, ORDER_STATUS } from "src/assets/configs/app.common";
import { readJSONFile } from "src/assets/utils/file";
import { Common } from "src/modules/common/entities/common.entity";
import { OrderProduct } from "src/modules/order/entities/order-product.entity";
import { Order } from "src/modules/order/entities/order.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderSeeder1728629816621 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const orders: Array<any> = await readJSONFile(path.join(__dirname, './data/order.json'));
    const commonData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type, \"group\"")
      .from(Common, "common")
      .where(`"common"."group" IN (:...group)`, { group: [PAYMENT_TYPE.GROUP, PAYMENT_STATUS.GROUP, ORDER_STATUS.GROUP] })
      .execute();

    await orders.reduce(async (pre: any, cur: any) => {
      const { status, payment_type, payment_status, products, ...others} = cur;
      const productData = await queryRunner.manager.createQueryBuilder()
        .select("\"id\", slug")
        .from(Product, "product")
        .where(`"product"."slug" IN (:...slug)`, { slug: products })
        .execute();

      const { identifiers } = await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Order)
        .values({
          ...others,
          statusId: commonData.find((f: any) => f.type === status && f.group === ORDER_STATUS.GROUP)?.id,
          paymentTypeId: commonData.find((f: any) => f.type === payment_type && f.group === PAYMENT_TYPE.GROUP)?.id,
          paymentStatusId: commonData.find((f: any) => f.type === payment_status && f.group === PAYMENT_STATUS.GROUP)?.id,
        })
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(OrderProduct)
        .values(products.map((t: any) => ({
          productId: productData.find((d: any) => d.slug === t).id,
          orderId: identifiers[0].id
        })))
        .execute();
      return pre;
    }, [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const orders: Array<any> = await readJSONFile(path.join(__dirname, './data/order.json'));
    await orders.reduce(async (pre: any, cur: any) => {
      try {
        const orderItem = await queryRunner.manager.createQueryBuilder()
          .select("\"id\"")
          .from(Order, "order")
          .where(
            `"order"."phone" = :phone AND "order"."address" = :address AND "order"."serial" = :serial`, 
            { 
              phone: cur.phone,
              address: cur.address,
              serial: cur.serial,
            }
          )
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Order, "order")
          .where(`"order"."id" = :id`, { id: orderItem[0]?.id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(OrderProduct, "order_product")
          .where(`"order_product"."order_id" = :orderId`, { orderId: orderItem[0]?.id })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
