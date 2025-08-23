import * as path from "path";
import { readJSONFile } from "src/assets/utils/file";
import { MigrationInterface, QueryRunner } from "typeorm";
import { Storage } from "src/modules/storage/entities/storage.entity";

const file = 'product2025-06-02.json'

export class StoragePackSeeder1749025265979 implements MigrationInterface {
   
  public async up(queryRunner: QueryRunner): Promise<void> {
    let data = await readJSONFile(path.join(__dirname, `./data/pack/${file}`));
    await queryRunner.connection.createQueryBuilder()
      .insert()
      .into(Storage)
      .values(data.map((d: any) => {
        console.log([
          d.name.toLowerCase(), 
          d.card_number.toLowerCase(), 
          d.pack_name.toLowerCase(), 
          d.description.toLowerCase()
        ].toString())
        return {
          ...d,
          release: d.time,
          serial: d.card_number,
          pack: d.pack_name,
          context: 'aaaa',
          image: d.name
            .replace(/[\t\n]/gm, '').replaceAll(' ', '_').replaceAll('/', '_')
            .replace('/', '').replaceAll('\\', '').replaceAll(':', '')
            .replace('*', '').replaceAll('?', '').replaceAll('"', '')
            .replace('|', '').replaceAll('<', '').replaceAll('>', '')
            + '.png'
        }
      }))
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.createQueryBuilder()
      .delete()
      .from(Storage, "storage")
      .execute();
  }

}
