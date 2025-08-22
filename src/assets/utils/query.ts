import { SelectQueryBuilder } from "typeorm";
import { MAX_SIZE } from "../configs/app.constant";

export const queryBuilderProcess = async (sql: SelectQueryBuilder<any>, callback: Function) => {
  const total = await sql.getCount();
  const times = Math.ceil(total / MAX_SIZE);
  await Array.from(Array(times).keys()).reduce(async (p: any, c: any) => {
    const data = await sql.offset(MAX_SIZE * c).limit(MAX_SIZE).getRawMany();
    await callback(data);
    return p;
  }, []);
}