import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const corsForImages = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Headers CORS essentiels
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Type, Content-Length"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Gérer les requêtes OPTIONS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};
