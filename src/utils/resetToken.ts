import jwt from "jsonwebtoken";

const RESET_SECRET = process.env.JWT_RESET_SECRET || "reset-secret";

// Génère un token valable 15 minutes
export const generateResetToken = (userId: string): string => {
  return jwt.sign({ userId }, RESET_SECRET, { expiresIn: "15m" });
};

// Vérifie le token
export const verifyResetToken = (token: string): { userId: string } => {
  return jwt.verify(token, RESET_SECRET) as { userId: string };
};
