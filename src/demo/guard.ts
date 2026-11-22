import { NextFunction, Request, Response, Router } from "express";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./accounts";

export const isDemoMode = () => process.env.DEMO_MODE === "true";

const refuse = (res: Response) =>
  res.status(403).json({ message: "Action désactivée dans la démo." });

// In the public demo every visitor shares the same accounts: nobody may lock
// the others out (password, e-mail) or remove an account. Everything else,
// including deleting data, is allowed: the nightly reset restores it.
export function demoGuard(req: Request, res: Response, next: NextFunction): void {
  const path = req.path;

  if (req.method === "POST" && /^\/api\/auth\/(change-password|forgot-password|reset-password)$/.test(path)) {
    refuse(res);
    return;
  }
  if (req.method === "DELETE" && /^\/api\/users\/[^/]+$/.test(path)) {
    refuse(res);
    return;
  }
  if ((req.method === "PUT" || req.method === "PATCH") && path.startsWith("/api/users/") && req.body) {
    delete req.body.email;
    delete req.body.password;
  }
  next();
}

// Shown on the sign-in screen so visitors can try each role in one click.
export const demoRoutes = Router().get("/accounts", (_req, res) => {
  res.json({ password: DEMO_PASSWORD, accounts: DEMO_ACCOUNTS });
});
