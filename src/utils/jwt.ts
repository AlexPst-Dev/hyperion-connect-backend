import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "../models/users-model";

export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ id: userId, role }, config.jwt.secret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};

export function generateTestJWT(user: User) {
  return jwt.sign(
    { id: user.id, role: user.profileCategory },
    process.env.JWT_SECRET || "your_secret_here",
    { expiresIn: "1h" }
  );
}
