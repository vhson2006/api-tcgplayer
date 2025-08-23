import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class StorageGenerate1728375771960 implements MigrationInterface {

  private table = 'storage';
  
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
            name: 'gary',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'attribute',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'effect',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'level',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'info',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'atk',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'def',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'serial',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'signal',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'rarity',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'release',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'pack',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'link',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'image',
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
