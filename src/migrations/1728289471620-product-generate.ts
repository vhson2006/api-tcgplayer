import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ProductGenerate1728289471620 implements MigrationInterface {

  private table = 'product';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: true,
            isUnique: true
          },
          {
            name: 'price',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'discount',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'promotion_price',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'extra',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'starttime',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'endtime',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'storage_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updated',
            type: 'timestamptz',
            default: 'now()'
          },
          {
            name: 'created',
            type: 'timestamptz',
            default: 'now()'
          },
          {
            name: 'deleted',
            type: 'timestamptz',
            isNullable: true
          }
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }

}
