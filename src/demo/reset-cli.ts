import { AppDataSource } from "../data-source";
import { isDemoMode } from "./guard";
import { resetDemo } from "./reset";

// Manual reset: `bun run demo:reset` (after `bun run build`).
async function main() {
  if (!isDemoMode()) {
    throw new Error("Refusing to reset: DEMO_MODE is not true. This script erases the whole database.");
  }
  await AppDataSource.initialize();
  try {
    await resetDemo(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error("Demo reset failed:", error);
  process.exit(1);
});
