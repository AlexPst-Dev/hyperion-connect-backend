import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  User,
  Sportsman,
  Coach,
  Medic,
  FreeUser,
  Partner,
  Admin,
} from "./models/users-model";
import { Contact } from "./models/contact-model";
import { Client } from "./models/client-model";
import { Sessions } from "./models/sessions-model";
import { Exercises } from "./models/exercices-model";
import { Events } from "./models/events-model";
import { Objectives } from "./models/objectives-model";
import { Billings } from "./models/billings-model";
import { CreateUserMigration1698734800000 } from "./migrations/users-migration";
import { CreateContactTable1698734800001 } from "./migrations/contact-migration";
import { CreateClientTable1698784800021 } from "./migrations/client-migration";
import { CreateSessionsTable1698734800002 } from "./migrations/sessions-migration";
import { CreateExercisesTable1698734800003 } from "./migrations/exercices-migration";
import { CreateEventsTable1698734800004 } from "./migrations/events-migration";
import { CreateObjectivesTable1698734800006 } from "./migrations/objectives-migration";
import { CreateBillingsTable1698734800006 } from "./migrations/billings-migration";
import * as dotenv from "dotenv";

dotenv.config(); // Charge les variables d'environnement

export const AppDataSource = new DataSource({
  type: "mysql",
  driver: require("mysql2"),
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "hyperion_connect",
  synchronize: false,
  logging: true, // Activez le logging pour déboguer
  entities: [
    User,
    Sportsman,
    Coach,
    Medic,
    FreeUser,
    Partner,
    Admin,
    Contact,
    Client,
    Sessions,
    Exercises,
    Events,
    Objectives,
    Billings,
  ],
  migrations: [
    CreateUserMigration1698734800000,
    CreateContactTable1698734800001,
    CreateClientTable1698784800021,
    CreateSessionsTable1698734800002,
    CreateExercisesTable1698734800003,
    CreateEventsTable1698734800004,
    CreateObjectivesTable1698734800006,
    CreateBillingsTable1698734800006,
  ],
  subscribers: [],
});
