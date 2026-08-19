import request from "supertest";
import { app } from "./helpers/testApp";
import { seedCategory } from "./helpers/seedCategory";

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role: "CANDIDATE", fullName: "Test User" });
  return res.body.data.accessToken as string;
}

describe("Worker profile", () => {
  it("creates a worker profile on first PUT (upsert)", async () => {
    const category = await seedCategory();
    const token = await registerAndLogin("worker1@test.com");

    const res = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Ramesh Kumar",
        categories: [category._id.toString()],
        baseLocation: { city: "Ghaziabad" },
        wageExpectation: { type: "DAILY", amount: 700 },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.profile.isNewWorker).toBe(true);
    expect(res.body.data.profile.trustScore).toBeGreaterThanOrEqual(20); // baseline floor
  });

  it("rejects worker profile creation without required fields", async () => {
    const token = await registerAndLogin("worker2@test.com");

    const res = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Incomplete Worker" }); // missing categories/location/wage

    expect(res.status).toBe(400);
  });

  it("only returns PUBLISHED-equivalent (always-searchable) worker profiles in public search", async () => {
    const category = await seedCategory();
    const token = await registerAndLogin("worker3@test.com");

    await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Suresh Singh",
        categories: [category._id.toString()],
        baseLocation: { city: "Noida" },
        wageExpectation: { type: "DAILY", amount: 600 },
      });

    const res = await request(app).get("/api/workers").query({ city: "Noida" });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("updates availability with a dedicated endpoint", async () => {
    const category = await seedCategory();
    const token = await registerAndLogin("worker4@test.com");

    await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Deepak",
        categories: [category._id.toString()],
        baseLocation: { city: "Delhi" },
        wageExpectation: { type: "HOURLY", amount: 100 },
      });

    const res = await request(app)
      .patch("/api/workers/me/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ availabilityState: "AVAILABLE_NOW" });

    expect(res.status).toBe(200);
    expect(res.body.data.profile.availabilityState).toBe("AVAILABLE_NOW");
  });
});