import dotenv from 'dotenv';

dotenv.config();

interface SequelizeConfig {
  username: string;
  password: string | null;
  database: string;
  host: string;
  dialect: 'mysql';
}

interface ConfigOptions {
  development: SequelizeConfig;
  test: SequelizeConfig;
  production: SequelizeConfig;
}

const config: ConfigOptions = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'database_development',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'database_production',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
  }
};

export default config;
