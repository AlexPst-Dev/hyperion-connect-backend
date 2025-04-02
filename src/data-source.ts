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
import {
  Events,
  HyperlinkEvent,
  CoachingEvent,
  SportingActivityEvent,
} from "./models/events-model";
import { Objectives } from "./models/objectives-model";
import { Billings } from "./models/billings-model";
import { Companies } from "./models/companies-model";
import { Offers, DiscountOffer, SponsorshipOffer } from "./models/offers-model";
import { Graphs } from "./models/graphs-model";
import { Files } from "./models/files-model";
import { Notifications } from "./models/notifications-model";
import { Categories } from "./models/categories-model";
import { Subscriptions } from "./models/subscription-model";

import {
  CreateUserMigration1698734800000,
  UpdateSportsmanMigration1698734800017,
  UpdateUserMigration1698734800016,
} from "./migrations/users-migration";
import { CreateContactTable1698734800001 } from "./migrations/contact-migration";
import { CreateClientTable1698784800021 } from "./migrations/client-migration";
import {
  CreateSessionsTable1698734800002,
  UpdateSessionsTable1698734800017,
} from "./migrations/sessions-migration";
import {
  CreateExercisesTable1698734800003,
  UpdateExercisesTable1698734800018,
} from "./migrations/exercices-migration";
import { CreateEventsTable1698734800006 } from "./migrations/events-migration";
import { CreateObjectivesTable1698734800006 } from "./migrations/objectives-migration";
import { UpdateBillingsTable1698734800014 } from "./migrations/billings-migration";
import { CreateCompaniesTable1698734800008 } from "./migrations/companies-migration";
import { CreateOffersTable1698734800008 } from "./migrations/offers-migration";
import { CreateGraphTable1698734800009 } from "./migrations/graphs-migration";
import { CreateFilesTable1698734800010 } from "./migrations/files-migration";
import { CreateNotificationsTable1698734800011 } from "./migrations/notifications-migration";
import { CreateCategoriesTable1698734800012 } from "./migrations/categories-migration";
import { CreateSubscriptionsTable1698734800013 } from "./migrations/subscription-migration";

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
    HyperlinkEvent,
    CoachingEvent,
    SportingActivityEvent,
    Offers,
    DiscountOffer,
    SponsorshipOffer,
    Billings,
    Companies,
    Objectives,
    Graphs,
    Files,
    Notifications,
    Categories,
    Subscriptions,
  ],
  migrations: [
    CreateUserMigration1698734800000,
    UpdateUserMigration1698734800016,
    CreateContactTable1698734800001,
    CreateClientTable1698784800021,
    CreateSessionsTable1698734800002,
    CreateExercisesTable1698734800003,
    CreateEventsTable1698734800006,
    CreateObjectivesTable1698734800006,
    UpdateBillingsTable1698734800014,
    CreateCompaniesTable1698734800008,
    CreateOffersTable1698734800008,
    CreateGraphTable1698734800009,
    CreateFilesTable1698734800010,
    CreateNotificationsTable1698734800011,
    CreateCategoriesTable1698734800012,
    CreateSubscriptionsTable1698734800013,
    UpdateSessionsTable1698734800017,
    UpdateExercisesTable1698734800018,
    UpdateSportsmanMigration1698734800017,
  ],
  subscribers: [],
});
