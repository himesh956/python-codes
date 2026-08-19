/**
 * Database seeder. Run with: npm run seed (from server/)
 *
 * Creates:
 * - 1 ADMIN account
 * - 5 EMPLOYER accounts (each with a Company)
 * - 15 CANDIDATE accounts (with realistic profiles)
 * - ~25 jobs spread across Ghaziabad/Noida/Greater Noida/Delhi/Gurugram
 * - Applications with varied statuses so the funnel/analytics charts
 *   have real data to show
 *
 * Safe to re-run: clears existing data in these collections first.
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { CandidateProfile } from "../models/CandidateProfile";
import { EmployerProfile } from "../models/EmployerProfile";
import { Company } from "../models/Company";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Resume } from "../models/Resume";
import { Skill } from "../models/Skill";
import { hashPassword } from "../utils/hash";
import { APPLICATION_STATUSES } from "../constants/enums";

const DEMO_PASSWORD = "Password@123";

const CITIES = [
  { city: "Ghaziabad", state: "Uttar Pradesh" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Greater Noida", state: "Uttar Pradesh" },
  { city: "Delhi", state: "Delhi" },
  { city: "Gurugram", state: "Haryana" },
];

const SKILL_POOL = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "Python",
  "Java",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "HTML",
  "CSS",
  "Tailwind CSS",
];

const JOB_TITLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "QA Engineer",
  "DevOps Engineer",
  "Software Engineer Intern",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearExisting(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    CandidateProfile.deleteMany({}),
    EmployerProfile.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Resume.deleteMany({}),
    Skill.deleteMany({}),
  ]);
  console.log("[seed] Cleared existing data");
}

async function seedSkills(): Promise<void> {
  await Skill.insertMany(SKILL_POOL.map((name) => ({ name })));
  console.log(`[seed] Created ${SKILL_POOL.length} skills`);
}

async function seedAdmin(): Promise<void> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  await User.create({
    email: "admin@localhire.dev",
    passwordHash,
    role: "ADMIN",
    isActive: true,
    isEmailVerified: true,
  });
  console.log("[seed] Created admin: admin@localhire.dev");
}

async function seedEmployers(): Promise<
  {
    userId: mongoose.Types.ObjectId;
    employerProfileId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
  }[]
> {
  const companyNames = [
    "Bytewave Technologies",
    "Ghaziabad Softworks",
    "Noida Digital Labs",
    "Delhi Cloud Systems",
    "Gurugram FinTech Hub",
  ];

  const results = [];
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (let i = 0; i < companyNames.length; i++) {
    const user = await User.create({
      email: `employer${i + 1}@localhire.dev`,
      passwordHash,
      role: "EMPLOYER",
      isActive: true,
      isEmailVerified: true,
    });

    const location = randomItem(CITIES);
    const company = await Company.create({
      name: companyNames[i],
      about: `${companyNames[i]} is a growing local technology company hiring across the NCR region.`,
      industry: "Software",
      locations: [location],
      createdBy: user._id,
      isVerified: true,
    });

    const employerProfile = await EmployerProfile.create({
      user: user._id,
      company: company._id,
      fullName: `Recruiter ${i + 1}`,
      designation: "HR Manager",
    });

    results.push({
      userId: user._id,
      employerProfileId: employerProfile._id,
      companyId: company._id,
    });
  }

  console.log(`[seed] Created ${results.length} employers with companies`);
  return results;
}

async function seedCandidates(): Promise<
  {
    userId: mongoose.Types.ObjectId;
    candidateProfileId: mongoose.Types.ObjectId;
  }[]
> {
  const results = [];
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (let i = 0; i < 15; i++) {
    const user = await User.create({
      email: `candidate${i + 1}@localhire.dev`,
      passwordHash,
      role: "CANDIDATE",
      isActive: true,
      isEmailVerified: true,
    });

    const preferredCity = randomItem(CITIES);
    const profile = await CandidateProfile.create({
      user: user._id,
      fullName: `Candidate ${i + 1}`,
      phone: `9${randomInt(100000000, 999999999)}`,
      bio: "First-year B.Tech CSE student looking for internship and entry-level opportunities.",
      currentLocation: preferredCity,
      preferredLocations: [preferredCity, randomItem(CITIES)],
      skills: randomItems(SKILL_POOL, randomInt(3, 6)),
      education: [
        {
          institution: "ABES Engineering College",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science",
          startYear: 2024,
          endYear: 2028,
        },
      ],
      expectedCTC: randomInt(300000, 800000),
      noticePeriodDays: randomItem([0, 15, 30]),
      jobPreferences: {
        employmentTypes: randomItems(["FULL_TIME", "INTERNSHIP"], 1),
        workModes: randomItems(["ON_SITE", "HYBRID", "REMOTE"], 2),
      },
    });

    results.push({ userId: user._id, candidateProfileId: profile._id });
  }

  console.log(`[seed] Created ${results.length} candidates`);
  return results;
}

async function seedJobs(
  employers: { employerProfileId: mongoose.Types.ObjectId; companyId: mongoose.Types.ObjectId }[]
): Promise<mongoose.Types.ObjectId[]> {
  const jobIds: mongoose.Types.ObjectId[] = [];

  for (let i = 0; i < 25; i++) {
    const employer = randomItem(employers);
    const location = randomItem(CITIES);
    const title = randomItem(JOB_TITLES);
    const salaryMin = randomInt(300000, 600000);
    const salaryMax = salaryMin + randomInt(100000, 400000);

    const job = await Job.create({
      employer: employer.employerProfileId,
      company: employer.companyId,
      title,
      description: `We are looking for a motivated ${title} to join our team in ${location.city}. You will work on real production features alongside a small, focused engineering team.`,
      responsibilities: [
        "Write clean, maintainable code",
        "Collaborate with cross-functional teams",
        "Participate in code reviews",
      ],
      requirements: ["Strong fundamentals in relevant technologies", "Good communication skills"],
      skills: randomItems(SKILL_POOL, randomInt(3, 5)),
      experienceMinYears: randomItem([0, 0, 1, 2]),
      experienceMaxYears: randomItem([1, 2, 3, 4]),
      employmentType: randomItem(["FULL_TIME", "INTERNSHIP", "PART_TIME"]),
      workMode: randomItem(["ON_SITE", "HYBRID", "REMOTE"]),
      location,
      salaryMin,
      salaryMax,
      salaryCurrency: "INR",
      openings: randomInt(1, 5),
      status: "PUBLISHED",
      benefits: ["Flexible hours", "Learning budget"],
      viewCount: randomInt(10, 300),
    });

    jobIds.push(job._id as mongoose.Types.ObjectId);
  }

  console.log(`[seed] Created ${jobIds.length} published jobs`);
  return jobIds;
}

async function seedApplications(
  candidates: { userId: mongoose.Types.ObjectId; candidateProfileId: mongoose.Types.ObjectId }[],
  jobIds: mongoose.Types.ObjectId[]
): Promise<void> {
  let count = 0;

  for (const candidate of candidates) {
    // Give each candidate a placeholder resume so applications are valid.
    const resume = await Resume.create({
      candidate: candidate.candidateProfileId,
      cloudinaryUrl: "https://example.com/placeholder-resume.pdf",
      cloudinaryPublicId: `seed/placeholder-${candidate.candidateProfileId.toString()}`,
      fileName: "resume.pdf",
      fileSizeBytes: 102400,
    });
    await CandidateProfile.findByIdAndUpdate(candidate.candidateProfileId, { resume: resume._id });

    const jobsToApply = randomItems(jobIds, randomInt(2, 5));

    for (const jobId of jobsToApply) {
      const job = await Job.findById(jobId);
      if (!job) continue;

      // Weighted random status so the funnel narrows realistically.
      const roll = Math.random();
      let finalStatus: (typeof APPLICATION_STATUSES)[number] = "APPLIED";
      if (roll > 0.85) finalStatus = "OFFERED";
      else if (roll > 0.65) finalStatus = "INTERVIEW";
      else if (roll > 0.4) finalStatus = "SHORTLISTED";
      else if (roll > 0.3) finalStatus = "REJECTED";

      const statusHistory = buildStatusHistory(finalStatus);
      const createdAt = new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000);

      try {
        await Application.create({
          candidate: candidate.candidateProfileId,
          job: job._id,
          employer: job.employer,
          company: job.company,
          resume: resume._id,
          status: finalStatus,
          statusHistory,
          appliedAt: createdAt,
          createdAt,
        });
        count++;
      } catch {
        // Duplicate (candidate, job) pair from random selection — skip silently.
      }
    }
  }

  console.log(`[seed] Created ${count} applications`);
}

function buildStatusHistory(
  finalStatus: (typeof APPLICATION_STATUSES)[number]
): { status: (typeof APPLICATION_STATUSES)[number]; changedAt: Date }[] {
  const order: (typeof APPLICATION_STATUSES)[number][] = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW",
    "OFFERED",
  ];
  const targetIndex = order.indexOf(finalStatus);

  if (targetIndex === -1) {
    // REJECTED or WITHDRAWN — treat as having passed through APPLIED first.
    return [
      { status: "APPLIED", changedAt: new Date() },
      { status: finalStatus, changedAt: new Date() },
    ];
  }

  return order.slice(0, targetIndex + 1).map((status) => ({ status, changedAt: new Date() }));
}

async function run(): Promise<void> {
  await connectDB();
  await clearExisting();
  await seedSkills();
  await seedAdmin();
  const employers = await seedEmployers();
  const candidates = await seedCandidates();
  const jobIds = await seedJobs(employers);
  await seedApplications(candidates, jobIds);

  console.log("\n[seed] Done. Demo accounts (all use password: " + DEMO_PASSWORD + "):");
  console.log("  Admin:      admin@localhire.dev");
  console.log("  Employer:   employer1@localhire.dev ... employer5@localhire.dev");
  console.log("  Candidate:  candidate1@localhire.dev ... candidate15@localhire.dev");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});