import dotenv from "dotenv";

dotenv.config();

console.log("🔧 Environment Variables Debug:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST ? "✅ Set" : "❌ Missing");
console.log("DB_PORT:", process.env.DB_PORT ? "✅ Set" : "❌ Missing");
console.log("DB_USER:", process.env.DB_USER ? "✅ Set" : "❌ Missing");
console.log("DB_PASS:", process.env.DB_PASS ? "✅ Set (hidden)" : "❌ Missing");
console.log("DB_NAME:", process.env.DB_NAME ? "✅ Set" : "❌ Missing");

export const config = {
  env: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "hyperion_connect",
    logging: process.env.DB_LOGGING === "true",
    synchronize: process.env.DB_SYNC === "true",
    dropSchema: process.env.DB_DROP_SCHEMA === "true",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "defaultsecret",
    expiresIn: process.env.JWT_EXPIRES_IN
      ? Number(process.env.JWT_EXPIRES_IN)
      : 86400,
  },
};
