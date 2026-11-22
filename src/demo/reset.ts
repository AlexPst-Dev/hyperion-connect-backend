import { DataSource } from "typeorm";
import { User } from "../models/users-model";
import { seedDemo } from "./seed";

// Rebuilds the demo database from scratch: drop every table, run the
// migrations, insert the fictional data.
export async function resetDemo(ds: DataSource): Promise<void> {
  const started = Date.now();
  await ds.dropDatabase(); // MySQL: drops every table of the configured database
  await ds.runMigrations();
  await seedDemo(ds);
  console.log(`Demo database reset in ${Date.now() - started} ms`);
}

const parisTime = () =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

// In demo mode the API seeds an empty database on startup, then resets it
// every night at 03:00 Paris time. In-process, so there is no second service
// to deploy and no race between two processes running migrations.
export async function startDemoScheduler(ds: DataSource): Promise<void> {
  if ((await ds.getRepository(User).count()) === 0) {
    await resetDemo(ds);
  }
  let lastRun = "";
  setInterval(() => {
    const now = parisTime();
    const today = new Date().toDateString();
    if (now === "03:00" && lastRun !== today) {
      lastRun = today;
      resetDemo(ds).catch((error) => console.error("Demo reset failed:", error));
    }
  }, 30 * 1000).unref();
}
