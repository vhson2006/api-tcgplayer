import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class OrderGenerate1728544228389 implements MigrationInterface {

  private table = 'order';

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
            name: 'serial',
            type: 'varchar',
            isNullable: true,
            isUnique: true
          },
          {
            name: 'phone',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'customer_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_type_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_status_id',
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
