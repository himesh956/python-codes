import request from "supertest";
import { app } from "./helpers/testApp";
import { seedCategory } from "./helpers/seedCategory";

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role: "CANDIDATE", fullName: "Test User" });
  return res.body.data.accessToken as string;
}

async function createWorker(token: string, categoryId: string) {
  const res = await request(app)
    .put("/api/workers/me")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fullName: "Test Worker",
      categories: [categoryId],
      baseLocation: { city: "Ghaziabad" },
      wageExpectation: { type: "DAILY", amount: 700 },
    });
  return res.body.data.profile._id as string;
}

describe("Booking lifecycle", () => {
  it("full lifecycle: request -> accept -> in_progress -> completed", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer1@test.com");
    const workerUserToken = await registerAndLogin("workeruser1@test.com");
    const workerId = await createWorker(workerUserToken, category._id.toString());

    const createRes = await request(app)
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
    expect(createRes.status).toBe(201);
    const bookingId = createRes.body.data.booking._id;

    const acceptRes = await request(app)
      .patch(`/api/bookings/${bookingId}/respond`)
      .set("Authorization", `Bearer ${workerUserToken}`)
      .send({ action: "ACCEPT" });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.booking.status).toBe("ACCEPTED");

    const progressRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status?as=worker`)
      .set("Authorization", `Bearer ${workerUserToken}`)
      .send({ status: "IN_PROGRESS" });
    expect(progressRes.status).toBe(200);

    const completeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status?as=worker`)
      .set("Authorization", `Bearer ${workerUserToken}`)
      .send({ status: "COMPLETED" });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.booking.status).toBe("COMPLETED");
  });

  it("prevents a customer from marking their own booking COMPLETED", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer2@test.com");
    const workerUserToken = await registerAndLogin("workeruser2@test.com");
    const workerId = await createWorker(workerUserToken, category._id.toString());

    const createRes = await request(app)
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
    const bookingId = createRes.body.data.booking._id;

    await request(app)
      .patch(`/api/bookings/${bookingId}/respond`)
      .set("Authorization", `Bearer ${workerUserToken}`)
      .send({ action: "ACCEPT" });

    // Customer tries to skip straight to COMPLETED — not in CUSTOMER_ALLOWED transitions.
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status?as=customer`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(400);
  });

  it("prevents a worker from responding to a booking that isn't theirs", async () => {
    const category = await seedCategory();
    const customerToken = await registerAndLogin("customer3@test.com");
    const workerUserToken = await registerAndLogin("workeruser3@test.com");
    const otherWorkerToken = await registerAndLogin("workeruser3b@test.com");
    const workerId = await createWorker(workerUserToken, category._id.toString());
    await createWorker(otherWorkerToken, category._id.toString());

    const createRes = await request(app)
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
    const bookingId = createRes.body.data.booking._id;

    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/respond`)
      .set("Authorization", `Bearer ${otherWorkerToken}`)
      .send({ action: "ACCEPT" });

    expect(res.status).toBe(403);
  });
});