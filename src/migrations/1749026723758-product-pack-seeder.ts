import * as path from "path";
import { CATEGORY, TAG, PRODUCT_TYPE, PRODUCT_STATUS } from "src/assets/configs/app.common";
import { readJSONFile } from "src/assets/utils/file";
import { Category } from "src/modules/category/entities/category.entity";
import { Common } from "src/modules/common/entities/common.entity";
import { Media } from "src/modules/media/entities/media.entity";
import { Attribute } from "src/modules/product/entities/attribute.entity";
import { ProductAttribute } from "src/modules/product/entities/product-attribute.entity";
import { ProductProductImage } from "src/modules/product/entities/product-product-image.entity";
import { ProductProductTag } from "src/modules/product/entities/product-product-tag.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { Tag } from "src/modules/tag/entities/tag.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { Storage } from "src/modules/storage/entities/storage.entity";

const file = 'item2025-06-02.json'

export class ProductPackSeeder1749026723758 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const product: Array<any> = await readJSONFile(path.join(__dirname, `./data/pack/${file}`));
    const categoryGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\"")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: CATEGORY.GROUP })
      .execute();
    const productCategoryData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Category, "category")
      .where(
        `"category"."type" IN (:...type) AND "category"."group_id" IN (:...groupId)`, 
        { type: product.map((e: any) => e.category), groupId: categoryGroupData.map((d: any) => d.id) }
      )
      .execute();
    const tagGroupData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\"")
      .from(Common, "common")
      .where(
        `"common"."type" = :type AND "common"."group" = :group`, 
        { type: TAG.PRODUCT, group: TAG.GROUP }
      )
      .execute();
    const productTagData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Tag, "tag")
      .where(
        `"tag"."type" IN (:...types) AND "tag"."group_id" IN (:...groupId)`, 
        { 
          types: product.reduce((pre: any, cur: any) => [...pre, ...cur.tags], []), 
          groupId: tagGroupData.map((d: any) => d.id) 
        }
      )
      .execute();
    const imageData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", name")
      .from(Media, "media")
      .where(
        `"media"."name" IN (:...name)`, 
        { name: product.reduce((pre: any, cur: any) => [...pre, ...cur.images], []) }
      )
      .execute();
    const attributeData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Attribute, "attribute")
      .where(
        `"attribute"."type" IN (:...type)`, 
        { type: product.reduce((pre: any, cur: any) => [...pre, ...Object.keys(cur.attributes) ], []) }
      )
      .execute();
    const producTypeData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: PRODUCT_TYPE.GROUP })
      .execute();
    const producStatusData = await queryRunner.manager.createQueryBuilder()
      .select("\"id\", type")
      .from(Common, "common")
      .where(`"common"."group" = :group`, { group: PRODUCT_STATUS.GROUP })
      .execute();
    await product.reduce(async (pre: any, cur: any) => {
      const { 
        category, type, status, tags, images, attributes,
        name, serial, signal, 
        ...productData 
      } = cur;
      let storageData = []
      if (signal) {
        storageData = await queryRunner.manager.createQueryBuilder()
          .select("\"id\", \"signal\", signal, pack")
          .from(Storage, "storage")
          .where(
            `"storage"."name" = :name AND "storage"."serial" = :serial AND "storage"."signal" = :signal`, 
            { name, serial, signal }
          )
          .execute();
      } else {
        storageData = await queryRunner.manager.createQueryBuilder()
          .select("\"id\", \"signal\", signal, pack")
          .from(Storage, "storage")
          .where(
            `"storage"."name" = :name AND "storage"."serial" = :serial`, 
            { name, serial }
          )
          .execute();
      }
      console.log(storageData)
      const { identifiers } = await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Product)
        .values({
          ...productData,
          name: name,
          description: name,
          slug: `${name.replace(/[\t\n]/gm, '').replaceAll(' ', '_').replaceAll('/', '_')}_${storageData[0].signal}_${serial}_${storageData[0].pack.replace(/[\t\n]/gm, '').replaceAll(' ', '_').replaceAll('/', '_')}`,
          categoryId: productCategoryData.find((d: any) => d.type === category).id,
          typeId: producTypeData.find((d: any) => d.type === type).id,
          statusId: producStatusData.find((d: any) => d.type === status).id,
          storageId: storageData[0].id,
        })
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(ProductProductTag)
        .values(tags.map((t: any) => ({
          productTagId: productTagData.find((d: any) => d.type === t).id,
          productId: identifiers[0].id
        })))
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(ProductProductImage)
        .values(images.map((t: any) => ({
          productImageId: imageData.find((i: any) => i.name === t).id,
          productId: identifiers[0].id
        })))
        .execute();
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(ProductAttribute)
        .values(Object.keys(attributes).map((t: any) => ({
          attributeId: attributeData.find((d: any) => d.type === t).id,
          productId: identifiers[0].id,
          value: attributes[t]
        })))
        .execute();
      return pre;
    }, []);
    
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const product: Array<any> = await readJSONFile(path.join(__dirname, `./data/pack/${file}`));
    await product.reduce(async (pre: any, cur: any) => {
      try {
        let productItem = []
        if (cur.signal) {
          productItem = await queryRunner.manager.createQueryBuilder()
            .select("product.\"id\", slug")
            .from(Product, "product")
            .innerJoin(Storage, "storage", 'storage.id = product.storage_id')
            .where(
              `"storage"."name" = :name AND "storage"."serial" = :serial AND "storage"."signal" = :signal`, 
              { name: cur.name, serial: cur.serial, signal: cur.signal }
            )
            .execute();
        } else {
          productItem = await queryRunner.manager.createQueryBuilder()
            .select("product.\"id\", slug")
            .from(Product, "product")
            .innerJoin(Storage, "storage", 'storage.id = product.storage_id')
            .where(
              `"storage"."name" = :name AND "storage"."serial" = :serial`, 
              { name: cur.name, serial: cur.serial }
            )
            .execute();
        }

        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(ProductProductTag, "product_product_tag")
          .where(`"product_product_tag"."product_id" = :productId`, { productId: productItem[0].id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(ProductProductImage, "product_product_image")
          .where(`"product_product_image"."product_id" = :productId`, { productId: productItem[0].id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(ProductAttribute, "product_attribute")
          .where(`"product_attribute"."product_id" = :productId`, { productId: productItem[0].id })
          .execute();
        await queryRunner.connection.createQueryBuilder()
          .delete()
          .from(Product, "product")
          .where(`"product"."id" = :id`, { id: productItem[0].id })
          .execute();
      } catch (e) {console.log(e)}
      return pre;
    }, []);
  }

}
