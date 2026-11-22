import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/config";
import { authenticateToken } from "./middleware/auth.middleware";
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
import { demoGuard, demoRoutes, isDemoMode } from "./demo/guard";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  app.use(express.json({ limit: "1mb" }));

  // Images and downloads are displayed by the web app from another origin:
  // allow cross-origin reads of resources (Helmet blocks them by default).
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.use(
    cors({
      // CORS_ORIGINS="https://app.example.com,https://admin.example.com".
      // Without it (local development only), every origin is accepted.
      origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      exposedHeaders: ["Content-Type", "Content-Length", "Content-Disposition"],
    })
  );

  const limiter = (max: number) =>
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max,
      message: { message: "Trop de requêtes. Réessayez plus tard." },
      standardHeaders: true,
      legacyHeaders: false,
    });

  // A whole app session stays far below 600 requests per quarter of an hour;
  // sign-in and password reset are limited much harder against brute force.
  app.use("/api", limiter(600));
  app.use(["/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"], limiter(20));

  app.get("/", (_req, res) => {
    res.send("API is running");
  });

  // Public demo: shared accounts listed on the sign-in screen, and the actions
  // that would lock other visitors out are disabled.
  if (isDemoMode()) {
    app.use(demoGuard);
    app.use("/api/demo", demoRoutes);
  }

  // Public: sign-in, sign-up and password reset (each protected route of the
  // auth router declares its own guard), and the news feed shown before login.
  app.use("/api/auth", authRoutes);
  app.use("/api/notifications", notificationsRoutes);

  // Everything else requires a valid token. Role checks stay in each router.
  app.use("/api/users", authenticateToken, userRoutes);
  app.use("/api/contacts", authenticateToken, contactRoutes);
  app.use("/api/clients", authenticateToken, clientRoutes);
  app.use("/api/sessions", authenticateToken, sessionRoutes);
  app.use("/api/exercises", authenticateToken, exercisesRoutes);
  app.use("/api/events", authenticateToken, eventRoutes);
  app.use("/api/objectives", authenticateToken, objectiveRoutes);
  app.use("/api/billings", authenticateToken, billingsRoutes);
  app.use("/api/companies", authenticateToken, companiesRoutes);
  app.use("/api/offers", authenticateToken, offersRoutes);
  app.use("/api/graphs", authenticateToken, graphsRoutes);
  app.use("/api/files", authenticateToken, filesRoutes);
  app.use("/api/categories", authenticateToken, categoriesRoutes);
  app.use("/api/subscriptions", authenticateToken, subscriptionsRoutes);
  app.use("/api/linkedSessions", authenticateToken, linkedSessionRoutes);
  // QR codes are checked by people who are not signed in: the verify route is
  // public by design (signed token, 5 minutes); the generate route has its guard.
  app.use("/api/verifications", qrCodeRoutes);

  return app;
};
