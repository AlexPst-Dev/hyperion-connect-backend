import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
// Import routes
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
import subscriptionsRoutes from "./routes/subscription-routes";
import linkedSessionRoutes from "./routes/linked-sessions-routes";
import qrCodeRoutes from "./routes/verification-routes";
// Import security middleware
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  // Middlewares
  app.use(express.json());
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(
    cors({
      origin: "*", // or specific front domain only
      methods: ["GET", "POST", "PATCH", "UPDATE", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      exposedHeaders: ["Content-Type", "Content-Length"],
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 7000, // max requests per windowMs
      message: {
        message: "Trop de requêtes. Réessayez plus tard.",
      },
      standardHeaders: true, // return RateLimit-* headers
      legacyHeaders: false,
    })
  );

  app.get("/", (_req, res) => {
    res.send("API is running ✅");
  });

  // Routes
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
  app.use("/api/subscriptions", subscriptionsRoutes);
  app.use("/api/linkedSessions", linkedSessionRoutes);
  app.use("/api/verifications", qrCodeRoutes);

  return app;
};
