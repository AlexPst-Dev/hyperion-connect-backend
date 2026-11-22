import request from "supertest";
import { createApp } from "../../server";
import { AppDataSource } from "../../data-source";
import { User } from "../../models/users-model";
import bcrypt from "bcryptjs";
import { Express } from "express";

let app: Express;

// Setup / Teardown
beforeAll(async () => {
  await AppDataSource.initialize();
  app = createApp(); // Créer l'app après l'initialisation de la DB
});

afterAll(async () => {
  const userRepo = AppDataSource.getRepository(User);
  await userRepo.delete({ email: "testauth@example.com" });
  await AppDataSource.destroy();
});

describe("🧪 Auth routes", () => {
  const email = "testauth@example.com";
  const password = "TestPassword123";

  it("✅ devrait enregistrer un utilisateur", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email,
      password,
      phone: "123456789",
      city: "Paris",
      street: "123 rue de test",
      postalCode: "75000",
      birthDate: "1990-01-01",
      profileCategory: "SPORTSMAN",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(email);
  });

  it("❌ devrait refuser un email déjà utilisé", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email,
      password,
      phone: "123456789",
      city: "Paris",
      street: "123 rue de test",
      postalCode: "75000",
      birthDate: "1990-01-01",
      profileCategory: "SPORTSMAN",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email already exists/i);
  });

  it("✅ devrait connecter un utilisateur", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("❌ devrait refuser une mauvaise combinaison login/mdp", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "WrongPassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/identifiants invalides/i);
  });

  it("❌ devrait refuser un login avec email inconnu", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "unknown@email.com",
      password: "whatever",
    });

    expect(response.status).toBe(401);
  });

  it("✅ devrait retourner les infos de l'utilisateur avec token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    const token = loginRes.body.token;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email);
  });

  it("❌ devrait refuser l'accès à /me sans token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401); // ou 403 selon ton middleware
  });
});
