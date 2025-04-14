import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: "Token manquant" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide" });
    return;
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }
    next();
  };
};

export const requireSelfOrAdmin = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const paramId = parseInt(req.params.id);
    if (req.user?.role === "admin" || req.user?.id === paramId) {
      next();
      return;
    }
    res.status(403).json({ message: "Accès interdit" });
    return;
  };
};

export const requireSelf = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const paramId = parseInt(req.params.userId || req.params.id);

    if (req.user?.id === paramId) {
      next();
      return;
    }

    res.status(403).json({
      message:
        "Accès interdit : vous ne pouvez accéder qu'à vos propres données.",
    });
    return;
  };
};
