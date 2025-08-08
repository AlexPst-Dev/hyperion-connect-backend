import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();
const isProd = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "mysql",
  driver: require("mysql2"),
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.db.synchronize,
  logging: config.db.logging,
  dropSchema: config.db.dropSchema,
  entities: [path.join(__dirname, isProd ? "/models/*.js" : "/models/*.ts")],
  migrations: [
    path.join(__dirname, isProd ? "/migrations/*.js" : "/migrations/*.ts"),
  ],
});
