import request from "supertest";
import { app } from "./helpers/testApp";
import { seedCategory } from "./helpers/seedCategory";

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role: "CANDIDATE", fullName: "Test User" });
  return res.body.data.accessToken as string;
}

describe("Trust score", () => {
  it("assigns the new-worker baseline score before any completed jobs", async () => {
    const category = await seedCategory();
    const token = await registerAndLogin("worker5@test.com");

    const res = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "New Worker",
        categories: [category._id.toString()],
        baseLocation: { city: "Ghaziabad" },
        wageExpectation: { type: "DAILY", amount: 700 },
      });

    expect(res.body.data.profile.trustScore).toBe(20); // baseline, no verification yet
    expect(res.body.data.profile.isNewWorker).toBe(true);
  });

  it("increases score after phone verification", async () => {
    const category = await seedCategory();
    const token = await registerAndLogin("worker6@test.com");

    await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Verified Worker",
        categories: [category._id.toString()],
        baseLocation: { city: "Ghaziabad" },
        wageExpectation: { type: "DAILY", amount: 700 },
      });

    await request(app)
      .post("/api/verifications")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "PHONE" });

    const profileRes = await request(app)
      .get("/api/workers/me")
      .set("Authorization", `Bearer ${token}`);

    expect(profileRes.body.data.profile.trustScore).toBeGreaterThan(20);
  });

  it("rejects a review for a booking that is not COMPLETED", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer4@test.com");
    const workerToken = await registerAndLogin("workeruser4@test.com");

    const workerRes = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${workerToken}`)
      .send({
        fullName: "Pending Worker",
        categories: [category._id.toString()],
        baseLocation: { city: "Ghaziabad" },
        wageExpectation: { type: "DAILY", amount: 700 },
      });
    const workerId = workerRes.body.data.profile._id;

    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        workerId,
        categoryId: category._id.toString(),
        isUrgent: false,
        requestedFor: new Date(Date.now() + 86400000).toISOString(),
        agreedWage: { type: "DAILY", amount: 700 },
        location: { city: "Ghaziabad" },
      });
    const bookingId = bookingRes.body.data.booking._id;

    // Still REQUESTED, never accepted/completed.
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ bookingId, reviewerRole: "CUSTOMER", rating: 5 });

    expect(res.status).toBe(400);
  });
});