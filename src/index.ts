import { AppDataSource } from "./data-source";
import { createApp } from "./server";

const PORT = process.env.PORT || 3000;

// Fonction principale
async function startServer() {
  try {
    // Initialisation de la BDD AVANT de créer l'app
    await AppDataSource.initialize();
    console.log("✅ MySQL connection established successfully.");
    console.log(
      "📦 Loaded entities:",
      AppDataSource.entityMetadatas.map((e) => e.name)
    );

    // Création de l'app Express APRÈS l'initialisation de la DB
    const app = createApp();

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1); // Stop le process si la connexion échoue
  }
}

// Démarrage du serveur
startServer();
