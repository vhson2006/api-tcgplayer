import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CommentGenerate1728724488449 implements MigrationInterface {

  private table = 'comment';

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
            name: 'comment',
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
            name: 'parent_id',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'post_slug',
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
