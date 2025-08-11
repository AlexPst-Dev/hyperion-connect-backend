import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

// Détermine si on est en mode développement ou production
const isDev =
  process.env.NODE_ENV !== "production" && __filename.endsWith(".ts");

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
  // Utilise les bons chemins selon l'environnement
  entities: isDev
    ? [path.join(__dirname, "/models/*.{js,ts}")]
    : [path.join(__dirname, "/models/*.js")],
  migrations: isDev
    ? [path.join(__dirname, "/migrations/*.{js,ts}")]
    : [path.join(__dirname, "/migrations/*.js")],
  subscribers: [],
});
