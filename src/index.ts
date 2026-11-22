import { config } from "./config/config";
import { AppDataSource } from "./data-source";
import { createApp } from "./server";
import { isDemoMode } from "./demo/guard";
import { startDemoScheduler } from "./demo/reset";

const PORT = Number(process.env.PORT) || 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

async function startServer() {
  try {
    await AppDataSource.initialize();
    // Apply pending migrations on startup: a fresh container gets the full schema.
    const applied = await AppDataSource.runMigrations();
    if (applied.length > 0) {
      console.log(`Applied ${applied.length} migration(s)`);
    }
    if (isDemoMode()) {
      await startDemoScheduler(AppDataSource);
    }

    const server = createApp().listen(PORT, () => {
      console.log(`${config.appName} API listening on port ${PORT} (${config.env})`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received, shutting down`);
      server.close(async () => {
        await AppDataSource.destroy();
        process.exit(0);
      });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
