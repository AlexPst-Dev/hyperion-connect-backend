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

export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRole || !allowedRoles.includes(userRole)) {
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
    const paramId = parseInt(
      req.params.id ||
        req.params.userId ||
        req.params.professionalId ||
        req.params.sportsmanId ||
        req.params.responsibleId
    );

    console.log("Param ID:", paramId);
    console.log("User ID:", req.user?.id);

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
    const paramId = parseInt(
      req.params.id ||
        req.params.userId ||
        req.params.professionalId ||
        req.params.sportsmanId ||
        req.params.responsibleId
    );

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

export const requireRoleOrSelf = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const paramId = parseInt(
      req.params.id ||
        req.params.userId ||
        req.params.professionalId ||
        req.params.sportsmanId ||
        req.params.responsibleId
    );

    if (!userRole) {
      res.status(403).json({ message: "Accès interdit" });
      return;
    }

    if (allowedRoles.includes(userRole)) {
      next();
      return;
    }

    if (userRole === "sportsman" && userId === paramId) {
      next();
      return;
    }

    res.status(403).json({ message: "Accès interdit" });
  };
};
