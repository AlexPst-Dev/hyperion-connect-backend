import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ id: userId, role }, config.jwt.secret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwt.secret);
};
