import { AppDataSource } from "./data-source";
import app from "./server";

const PORT = process.env.PORT || 3000;

// Initialisation de la BDD avant de démarrer le serveur
AppDataSource.initialize()
  .then(() => {
    console.log("✅ MySQL connection established successfully.");
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
    process.exit(1); // Stop le process si la connexion échoue
  });
