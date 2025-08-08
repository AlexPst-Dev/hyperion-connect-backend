import { AppDataSource } from "./data-source";
import app from "./server";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Connected to DB:", AppDataSource.options.database);
    console.log(
      "📦 Loaded entities:",
      AppDataSource.entityMetadatas.map((e) => e.name)
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error);
  });
