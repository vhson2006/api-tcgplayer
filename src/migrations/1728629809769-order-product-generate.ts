import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class OrderProductGenerate1728629809769 implements MigrationInterface {

  private table = 'order_product';

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
            name: 'order_id',
            type: 'varchar',
          },
          {
            name: 'product_id',
            type: 'varchar',
          },
          {
            name: 'quantity',
            type: 'varchar',
            default: 1
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
