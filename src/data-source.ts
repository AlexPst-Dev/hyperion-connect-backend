import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { config } from "./config/config";

// Compiled build (dist/*.js) or ts-node in development and tests (src/*.ts).
const ext = __filename.endsWith(".ts") ? "{js,ts}" : "js";

// The schema is only ever changed by migrations (never `synchronize`), so the
// production database and the demo database are built the same way.
export const AppDataSource = new DataSource({
  type: "mysql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: false,
  logging: config.db.logging,
  entities: [path.join(__dirname, `models/*.${ext}`)],
  migrations: [path.join(__dirname, `migrations/*.${ext}`)],
});
