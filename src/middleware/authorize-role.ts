import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const authorizeRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Accès interdit. Rôle insuffisant." });
      return;
    }

    next();
  };
};
