import request from "supertest";
import { app } from "./helpers/testApp";

async function registerAndLogin(role: "CANDIDATE" | "EMPLOYER", email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role, fullName: "Test User" });
  return res.body.data.accessToken as string;
}

describe("RBAC", () => {
  it("blocks a CANDIDATE from creating a job (EMPLOYER-only route)", async () => {
    const token = await registerAndLogin("CANDIDATE", "cand@test.com");

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Frontend Developer",
        description: "A great opportunity for a frontend developer role.",
        skills: ["React"],
        employmentType: "FULL_TIME",
        workMode: "ON_SITE",
        location: { city: "Ghaziabad" },
      });

    expect(res.status).toBe(403);
  });

  it("blocks an EMPLOYER from accessing candidate-only routes", async () => {
    const token = await registerAndLogin("EMPLOYER", "emp@test.com");

    const res = await request(app)
      .get("/api/candidates/profile")
      .set("Authorization", `Bearer ${token}`);

    // EMPLOYER role fails authorize() before ever reaching the "not found" case.
    expect(res.status).toBe(403);
  });

  it("blocks unauthenticated access to admin routes", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("blocks a non-admin authenticated user from admin routes", async () => {
    const token = await registerAndLogin("CANDIDATE", "cand2@test.com");
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});