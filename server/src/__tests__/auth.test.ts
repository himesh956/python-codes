import request from "supertest";
import { app } from "./helpers/testApp";

describe("Auth", () => {
  const candidatePayload = {
    email: "candidate1@test.com",
    password: "Password123",
    role: "CANDIDATE",
    fullName: "Test Candidate",
  };

  it("registers a new candidate and returns an access token", async () => {
    const res = await request(app).post("/api/auth/register").send(candidatePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(candidatePayload.email);
    expect(res.body.data.user.role).toBe("CANDIDATE");
  });

  it("rejects registration with a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(candidatePayload);
    const res = await request(app).post("/api/auth/register").send(candidatePayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...candidatePayload, email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("rejects registration with a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...candidatePayload, password: "short" });

    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(candidatePayload);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: candidatePayload.email, password: candidatePayload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(candidatePayload);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: candidatePayload.email, password: "WrongPassword1" });

    expect(res.status).toBe(401);
  });

  it("returns the current user from /me when authenticated", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(candidatePayload);
    const token = registerRes.body.data.accessToken;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(candidatePayload.email);
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});