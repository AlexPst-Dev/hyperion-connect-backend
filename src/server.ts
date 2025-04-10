import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import dotenv from "dotenv";
import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";
import contactRoutes from "./routes/contact-routes";
import clientRoutes from "./routes/client-routes";
import sessionRoutes from "./routes/session-routes";
import exercisesRoutes from "./routes/exercise-routes";
import eventRoutes from "./routes/event-routes";
import objectiveRoutes from "./routes/objective-routes";
import billingsRoutes from "./routes/billing-routes";
import companiesRoutes from "./routes/company-routes";
import offersRoutes from "./routes/offer-routes";
import graphsRoutes from "./routes/graph-routes";
import filesRoutes from "./routes/file-routes";
import notificationsRoutes from "./routes/notification-routes";
import categoriesRoutes from "./routes/category-routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await AppDataSource.initialize();
    console.log("MySQL connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Express MySQL project with TypeORM!" });
});

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/contacts", contactRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/exercises", exercisesRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/objectives", objectiveRoutes);

app.use("/api/billings", billingsRoutes);

app.use("/api/companies", companiesRoutes);

app.use("/api/offers", offersRoutes);

app.use("/api/graphs", graphsRoutes);

app.use("/api/files", filesRoutes);

app.use("/api/notifications", notificationsRoutes);

app.use("/api/categories", categoriesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testDatabaseConnection();
});
