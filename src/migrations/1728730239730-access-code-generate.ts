import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AccessCodeGenerate1728730239730 implements MigrationInterface {

  private table = 'access_code';

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
            name: 'times',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'start_time',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'end_time',
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
