import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class EmloyeeGenerate1724661836940 implements MigrationInterface {
  private table = 'employee';

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
            name: 'identified',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'dob',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'avatar_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'latitude',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'longitude',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'status_id',
            type: 'varchar',
          },
          {
            name: 'role_id',
            type: 'varchar',
            isNullable: true
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
