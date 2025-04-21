import request from "supertest";
import { AppDataSource } from "../data-source";
import app from "../server";
import { User, ProfileCategory, Sportsman } from "../models/users-model";
import { generateTestJWT } from "../utils/jwt";

let authToken: string;
let userId: number;

beforeAll(async () => {
  await AppDataSource.initialize();

  // Create a test user and sportsman profile
  const userRepo = AppDataSource.getRepository(User);
  const sportsmanRepo = AppDataSource.getRepository(Sportsman);

  const user = userRepo.create({
    email: "testuser@example.com",
    password: "password", // let's assume this is hashed
    firstName: "John",
    lastName: "Doe",
    profileCategory: ProfileCategory.SPORTSMAN,
  });
  await userRepo.save(user);

  const profile = sportsmanRepo.create({ user });
  await sportsmanRepo.save(profile);

  userId = user.id;

  const adminUser = userRepo.create({
    email: "admin@example.com",
    password: "password",
    firstName: "Admin",
    lastName: "User",
    profileCategory: ProfileCategory.ADMIN,
  });
  await userRepo.save(adminUser);

  authToken = "Bearer " + generateTestJWT(adminUser);
});

afterAll(async () => {
  const userRepo = AppDataSource.getRepository(User);
  await userRepo.delete({ email: "admin@example.com" });
  await AppDataSource.destroy();
});

describe("GET /sportsman/:id/subscription", () => {
  it("should return subscription for a valid sportsman user", async () => {
    const user = await AppDataSource.getRepository(User).findOneBy({
      email: "testuser@example.com",
    });

    const res = await request(app)
      .get(`/api/users/sportsman/${user?.id}/subscription`)
      .set("Authorization", authToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("subscription");
  });
});

describe("PATCH /users/:id/:profileCategory", () => {
  it("should update user and profile data", async () => {
    const user = await AppDataSource.getRepository(User).findOneBy({
      email: "testuser@example.com",
    });

    const res = await request(app)
      .patch(`/api/users/${user?.id}/${ProfileCategory.SPORTSMAN}`)
      .set("Authorization", authToken)
      .send({ lastName: "DOE" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User and profile updated successfully");
  });
});

describe("DELETE /users/:id", () => {
  it("should delete user as admin", async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", authToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });
});
