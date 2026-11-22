import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";

// Secrets have no default value: a missing secret must stop the server rather
// than let it sign tokens with a key anyone can read in this repository.
// Tests get a throwaway key so they run without any setup.
function requiredSecret(name: string): string {
  const value = process.env[name];
  if (value) return value;
  if (env === "test") return `${name.toLowerCase()}-for-tests-only`;
  throw new Error(`Missing environment variable ${name}`);
}

export const config = {
  env,
  appName: process.env.APP_NAME || "SportLink",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8081",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "sportlink",
    logging: process.env.DB_LOGGING === "true",
  },
  jwt: {
    secret: requiredSecret("JWT_SECRET"),
    resetSecret: requiredSecret("JWT_RESET_SECRET"),
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};
