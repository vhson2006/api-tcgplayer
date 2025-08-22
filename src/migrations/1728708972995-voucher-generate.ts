import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class VoucherGenerate1728708972995 implements MigrationInterface {

  private table = 'voucher';

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
            name: 'code',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'value',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'min',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'max',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'condition_value',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'status_id',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'type_id',
            type: 'varchar',
          },
          {
            name: 'condition_type_id',
            type: 'varchar',
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
