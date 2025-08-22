import "reflect-metadata"
import * as dotenv from "dotenv";
import {  DataSource } from "typeorm"

dotenv.config();
export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/*/*/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
})
