import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import dotenv from "dotenv";
import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await AppDataSource.initialize(); // Initialisation de la connexion avec TypeORM
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testDatabaseConnection();
});
