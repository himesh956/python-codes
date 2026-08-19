import request from "supertest";
import { app } from "./helpers/testApp";

async function registerEmployer(email = "emp@test.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password123", role: "EMPLOYER", fullName: "Employer One" });
  return res.body.data.accessToken as string;
}

const validJobPayload = {
  title: "Backend Developer",
  description: "We are looking for a skilled backend developer to join our growing team.",
  skills: ["Node.js", "MongoDB"],
  employmentType: "FULL_TIME",
  workMode: "HYBRID",
  location: { city: "Noida" },
  salaryMin: 400000,
  salaryMax: 700000,
};

describe("Job creation and ownership", () => {
  it("creates a job as DRAFT for the authenticated employer", async () => {
    const token = await registerEmployer();

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(validJobPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.job.status).toBe("DRAFT");
  });

  it("rejects job creation with salaryMax less than salaryMin", async () => {
    const token = await registerEmployer();

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validJobPayload, salaryMin: 800000, salaryMax: 500000 });

    expect(res.status).toBe(400);
  });

  it("prevents one employer from editing another employer's job", async () => {
    const tokenA = await registerEmployer("empA@test.com");
    const tokenB = await registerEmployer("empB@test.com");

    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validJobPayload);
    const jobId = createRes.body.data.job._id;

    const editRes = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked Title" });

    expect(editRes.status).toBe(403);
  });

  it("only shows PUBLISHED jobs in public search", async () => {
    const token = await registerEmployer();
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(validJobPayload); // stays DRAFT

    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it("shows a job in search after publishing it", async () => {
    const token = await registerEmployer();
    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(validJobPayload);
    const jobId = createRes.body.data.job._id;

    await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "PUBLISHED" });

    const res = await request(app).get("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe(validJobPayload.title);
  });
});