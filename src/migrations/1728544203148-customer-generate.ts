import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CustomerGenerate1728544203148 implements MigrationInterface {

  private table = 'customer';

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
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'type_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
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
