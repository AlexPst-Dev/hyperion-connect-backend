import jwt from "jsonwebtoken";
import { config } from "../config/config";

// Password reset token, valid for 15 minutes, signed with its own secret so a
// reset link can never be used as a session token (and the other way round).
export const generateResetToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.resetSecret, { expiresIn: "15m" });
};

export const verifyResetToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.resetSecret) as { userId: string };
};
