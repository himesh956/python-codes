import request from "supertest";
import { app } from "./helpers/testApp";

async function registerAdmin(email = "admin@test.com") {
  // No public admin registration route exists (by design) — for this
  // test we register as CANDIDATE then promote via direct model update,
  // mirroring how a real ADMIN account gets created (seed script / DB).
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role: "CANDIDATE", fullName: "Admin User" });

  const { User } = await import("../models/User");
  await User.findOneAndUpdate({ email }, { role: "ADMIN" });

  // Re-login to get a token with the updated role embedded.
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "Password123" });

  return loginRes.body.data.accessToken as string;
}

describe("Admin analytics endpoints", () => {
  it("blocks non-admins from analytics endpoints", async () => {
    const res = await request(app).get("/api/admin/analytics/top-skills");
    expect(res.status).toBe(401);
  });

  it("returns an empty but well-formed response when there is no data", async () => {
    const token = await registerAdmin();

    const res = await request(app)
      .get("/api/admin/analytics/top-skills")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it("returns funnel stages with zero counts when there are no applications", async () => {
    const token = await registerAdmin("admin2@test.com");

    const res = await request(app)
      .get("/api/admin/analytics/funnel")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      { stage: "APPLIED", count: 0 },
      { stage: "SHORTLISTED", count: 0 },
      { stage: "INTERVIEW", count: 0 },
      { stage: "OFFERED", count: 0 },
    ]);
  });
});