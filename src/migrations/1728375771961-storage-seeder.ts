import * as path from "path";
import { readJSONFile, readFolder } from "src/assets/utils/file";
import { Storage } from "src/modules/storage/entities/storage.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageSeeder1728375771961 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const files = await readFolder(path.join(__dirname, './data/storage'));
    let data: Array<any> = []
    for (const file of files) {
      data = await readJSONFile(path.join(__dirname, `./data/storage/${file}`));
      await queryRunner.connection.createQueryBuilder()
        .insert()
        .into(Storage)
        .values(data.map(d => ({
          ...d,
          release: d.time,
          serial: d.card_number,
          pack: d.pack_name,
          image: d.name
            .replace(/[\t\n]/gm, '').replaceAll(' ', '_').replaceAll('/', '_')
            .replace('/', '').replaceAll('\\', '').replaceAll(':', '')
            .replace('*', '').replaceAll('?', '').replaceAll('"', '')
            .replace('|', '').replaceAll('<', '').replaceAll('>', '')
            + '.png'
        })))
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.createQueryBuilder()
      .delete()
      .from(Storage, "storage")
      .execute();
  }

}
