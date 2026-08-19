import request from "supertest";
import { app } from "./helpers/testApp";
import { seedCategory } from "./helpers/seedCategory";

async function registerAndLogin(email: string, role: "CANDIDATE" = "CANDIDATE") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role, fullName: "Test User" });
  return res.body.data.accessToken as string;
}

describe("Disputes", () => {
  it("blocks a stranger from filing a dispute on someone else's booking", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer5@test.com");
    const workerToken = await registerAndLogin("workeruser5@test.com");
    const strangerToken = await registerAndLogin("stranger@test.com");

    const workerRes = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${workerToken}`)
      .send({
        fullName: "Worker",
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

    const res = await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ bookingId, reason: "I have no relation to this booking at all" });

    expect(res.status).toBe(403);
  });

  it("prevents filing a second dispute on the same booking", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer6@test.com");
    const workerToken = await registerAndLogin("workeruser6@test.com");

    const workerRes = await request(app)
      .put("/api/workers/me")
      .set("Authorization", `Bearer ${workerToken}`)
      .send({
        fullName: "Worker",
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

    await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ bookingId, reason: "First dispute reason, long enough to pass validation" });

    const res = await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ bookingId, reason: "Second dispute reason, also long enough to pass" });

    expect(res.status).toBe(409);
  });
});