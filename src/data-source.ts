import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, Sportsman, Coach, Medic, FreeUser, Partner, Admin } from './models/user-model'; 
import { Contact } from './models/contact-model'; 
import { Client } from './models/client-model'; 
import { Sessions } from './models/sessions-model'; 
import { Exercises } from './models/exercices-model'; 
import { CreateUserMigration1698734800000 } from './migrations/user-migration'; 
import { CreateContactTable1698734800001 } from './migrations/contact-migration';
import { CreateClientTable1698784800021 } from './migrations/client-migration'
import { CreateSessionsTable1698734800002 } from './migrations/sessions-migration'
import { CreateExercisesTable1698734800003 } from './migrations/exercices-migration'
import * as dotenv from 'dotenv';

dotenv.config(); // Charge les variables d'environnement

export const AppDataSource = new DataSource({
  type: 'mysql',
  driver: require('mysql2'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'hyperion_connect',
  synchronize: false,
  logging: true, // Activez le logging pour déboguer
  entities: [User, Sportsman, Coach, Medic, FreeUser, Partner, Admin, Contact, Client, Sessions, Exercises],
  migrations: [CreateUserMigration1698734800000, CreateContactTable1698734800001, CreateClientTable1698784800021, CreateSessionsTable1698734800002, CreateExercisesTable1698734800003],
  subscribers: [],
});