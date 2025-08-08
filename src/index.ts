import { AppDataSource } from "./data-source";
import app from "./server";

const PORT = process.env.PORT || 3000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await AppDataSource.initialize();
    console.log("MySQL connection has been established successfully.");
    console.log("✅ Connected to DB:", AppDataSource.options.database);
    console.log(
      "📦 Loaded entities:",
      AppDataSource.entityMetadatas.map((e) => e.name)
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testDatabaseConnection();
});
