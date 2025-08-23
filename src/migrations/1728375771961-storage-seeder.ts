import * as path from "path";
import { sliceIntoChunks } from "src/assets/utils/array";
import { readJSONFile, readFolder } from "src/assets/utils/file";
import { Storage } from "src/modules/storage/entities/storage.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class StorageSeeder1728375771961 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const files = await readFolder(path.join(__dirname, './data/storage'));
    let data: Array<any> = []
    for (const file of files) {
      data = await readJSONFile(path.join(__dirname, `./data/storage/${file}`));
      let x = data.map(d => {
        return {
          ...d,
          release: d.time,
          serial: d.card_number,
          pack: d.pack_name,
          image: d.name
            .replace(/[\t\n]/gm, '').replaceAll(' ', '_').replaceAll('/', '_')
            .replace('/', '').replaceAll('\\', '').replaceAll(':', '')
            .replace('*', '').replaceAll('?', '').replaceAll('"', '')
            .replace('|', '').replaceAll('<', '').replaceAll('>', '')
            + '.png',
          gary: [
            d.name.toLowerCase(), 
            d.card_number.toLowerCase(), 
            d.pack_name.toLowerCase(), 
            d.description.toLowerCase()
          ].toString(),
        }
      })
      
      for (const ele of sliceIntoChunks(x, 1000)) {
        await queryRunner.connection.createQueryBuilder()
          .insert()
          .into(Storage)
          .values(ele)
          .execute();
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.createQueryBuilder()
      .delete()
      .from(Storage, "storage")
      .execute();
  }

}
