import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import {
  authenticateToken,
  requireRole,
  requireSelf,
  requireSelfOrAdmin,
  requireRoleOrSelf,
} from "../../middleware/auth.middleware";

const app = express();
app.use(express.json());

const createToken = (payload: any) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1h" });

/*
 * Testing the authenticateToken middleware
 */
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Access granted" });
});

test("should return 401 if token is missing", async () => {
  const res = await request(app).get("/protected");
  expect(res.status).toBe(401);
});

test("should return 403 if token is invalid", async () => {
  const res = await request(app)
    .get("/protected")
    .set("Authorization", "Bearer badtoken");
  expect(res.status).toBe(403);
});

test("should allow access if token is valid", async () => {
  const token = createToken({ id: 1, role: "admin" });
  const res = await request(app)
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

/*
 * Testing the requireRole middleware
 */
app.get("/admin", authenticateToken, requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Welcome admin" });
});

test("should forbid access for non-admin", async () => {
  const token = createToken({ id: 2, role: "coach" });
  const res = await request(app)
    .get("/admin")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(403);
});

test("should allow access for admin", async () => {
  const token = createToken({ id: 2, role: "admin" });
  const res = await request(app)
    .get("/admin")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

/*
 * Testing the requireSelf middleware
 */
app.get("/me/:id", authenticateToken, requireSelf(), (req, res) => {
  res.status(200).json({ message: "Welcome self" });
});

test("should allow access to self", async () => {
  const token = createToken({ id: 42, role: "sportsman" });
  const res = await request(app)
    .get("/me/42")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

test("should deny access to other users", async () => {
  const token = createToken({ id: 42, role: "sportsman" });
  const res = await request(app)
    .get("/me/99")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(403);
});

/*
 * Testing the requireSelfOrAdmin middleware
 */
app.get("/user/:id", authenticateToken, requireSelfOrAdmin(), (req, res) => {
  res.status(200).json({ message: "Access ok" });
});

test("admin can access any user", async () => {
  const token = createToken({ id: 1, role: "admin" });
  const res = await request(app)
    .get("/user/123")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

/*
 * Testing the requireRoleOrSelf middleware
 */
app.get(
  "/profile/:id",
  authenticateToken,
  requireRoleOrSelf(["coach", "admin"]),
  (req, res) => {
    res.status(200).json({ message: "Access ok" });
  }
);

test("coach can access profile", async () => {
  const token = createToken({ id: 5, role: "coach" });
  const res = await request(app)
    .get("/profile/123")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

test("sportsman can only access their own profile", async () => {
  const token = createToken({ id: 42, role: "sportsman" });
  const res = await request(app)
    .get("/profile/42")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

test("sportsman can't access another profile", async () => {
  const token = createToken({ id: 42, role: "sportsman" });
  const res = await request(app)
    .get("/profile/99")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(403);
});
