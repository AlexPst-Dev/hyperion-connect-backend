import { AppDataSource } from "./data-source";
import { createApp } from "./server";

const PORT = process.env.PORT || 3000;

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Fonction principale avec timeout
async function startServer() {
  try {
    console.log("🚀 Starting server initialization...");
    console.log("📍 Current working directory:", process.cwd());
    console.log(
      "📁 Files in current directory:",
      require("fs").readdirSync(".")
    );

    // Timeout pour éviter les blocages
    const dbInitPromise = AppDataSource.initialize();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 30000)
    );

    await Promise.race([dbInitPromise, timeoutPromise]);

    console.log("✅ MySQL connection established successfully.");
    console.log(
      "📦 Loaded entities:",
      AppDataSource.entityMetadatas.map((e) => e.name)
    );

    // Vérification que les entités sont bien chargées
    if (AppDataSource.entityMetadatas.length === 0) {
      throw new Error("No entities loaded! Check your entities path.");
    }

    // Création de l'app Express APRÈS l'initialisation de la DB
    const app = createApp();

    // Test de la connexion DB avant de démarrer le serveur
    await AppDataSource.query("SELECT 1");
    console.log("✅ Database connection test successful");

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check available at: http://localhost:${PORT}/`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`📥 Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        try {
          await AppDataSource.destroy();
          console.log("✅ Database connection closed.");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Informations supplémentaires pour le debug
    console.error("🔍 Debug info:");
    console.error("- Working directory:", process.cwd());
    console.error("- Node version:", process.version);
    console.error("- Platform:", process.platform);

    process.exit(1);
  }
}

// Démarrage du serveur
startServer();
