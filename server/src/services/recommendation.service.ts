import { Job, IJob } from "../models/Job";
import { CandidateProfile, ICandidateProfile } from "../models/CandidateProfile";
import { AppError } from "../utils/AppError";

interface MatchBreakdown {
  skillsScore: number;
  locationScore: number;
  experienceScore: number;
  ctcScore: number;
  jobTypeScore: number;
}

export interface JobMatch {
  job: IJob;
  matchPercent: number;
  breakdown: MatchBreakdown;
  explanation: string[];
}

const WEIGHTS = {
  skills: 50,
  location: 20,
  experience: 15,
  ctc: 10,
  jobType: 5,
};

function scoreJob(candidate: ICandidateProfile, job: IJob): JobMatch {
  const explanation: string[] = [];

  const candidateSkills = new Set(candidate.skills.map((s) => s.toLowerCase()));
  const jobSkills = job.skills.map((s) => s.toLowerCase());
  const matchedSkills = jobSkills.filter((s) => candidateSkills.has(s));
  const skillsRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
  const skillsScore = Math.round(skillsRatio * WEIGHTS.skills);
  explanation.push(`${matchedSkills.length}/${jobSkills.length} skills matched`);

  const preferredCities = new Set(
    candidate.preferredLocations.map((l) => l.city.toLowerCase())
  );
  const currentCity = candidate.currentLocation?.city?.toLowerCase();
  const jobCity = job.location.city.toLowerCase();
  const locationMatched =
    job.workMode === "REMOTE" || preferredCities.has(jobCity) || currentCity === jobCity;
  const locationScore = locationMatched ? WEIGHTS.location : 0;
  explanation.push(locationMatched ? "Location matched" : "Location did not match preferences");

  const candidateYears = estimateCandidateExperienceYears(candidate);
  const experienceMatched =
    candidateYears >= job.experienceMinYears &&
    (job.experienceMaxYears === undefined || candidateYears <= job.experienceMaxYears);
  const experienceScore = experienceMatched ? WEIGHTS.experience : 0;
  explanation.push(experienceMatched ? "Experience matched" : "Experience outside job's range");

  let ctcScore = WEIGHTS.ctc / 2;
  if (candidate.expectedCTC && job.salaryMax) {
    const compatible = job.salaryMax >= candidate.expectedCTC * 0.85;
    ctcScore = compatible ? WEIGHTS.ctc : 0;
    explanation.push(compatible ? "Expected CTC compatible" : "Expected CTC above job's range");
  }

  const preferredTypes = candidate.jobPreferences?.employmentTypes ?? [];
  const jobTypeMatched = preferredTypes.length === 0 || preferredTypes.includes(job.employmentType);
  const jobTypeScore = jobTypeMatched ? WEIGHTS.jobType : 0;
  if (preferredTypes.length > 0) {
    explanation.push(jobTypeMatched ? "Job type matches preference" : "Job type not preferred");
  }

  const matchPercent = Math.round(
    skillsScore + locationScore + experienceScore + ctcScore + jobTypeScore
  );

  return {
    job,
    matchPercent,
    breakdown: { skillsScore, locationScore, experienceScore, ctcScore, jobTypeScore },
    explanation,
  };
}

function estimateCandidateExperienceYears(candidate: ICandidateProfile): number {
  if (candidate.experience.length === 0) return 0;

  let totalMonths = 0;
  for (const exp of candidate.experience) {
    if (!exp.startDate) continue;
    const end = exp.isCurrent || !exp.endDate ? new Date() : exp.endDate;
    const months =
      (end.getFullYear() - exp.startDate.getFullYear()) * 12 +
      (end.getMonth() - exp.startDate.getMonth());
    totalMonths += Math.max(0, months);
  }
  return Math.round(totalMonths / 12);
}

async function getRecommendationsForCandidate(userId: string, limit = 10): Promise<JobMatch[]> {
  const candidate = await CandidateProfile.findOne({ user: userId });
  if (!candidate) {
    throw AppError.notFound("Candidate profile not found");
  }

  const candidatePool = await Job.find({ status: "PUBLISHED" })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("company", "name logoUrl");

  const scored = candidatePool.map((job) => scoreJob(candidate, job));
  scored.sort((a, b) => b.matchPercent - a.matchPercent);

  return scored.slice(0, limit);
}

export const recommendationService = { getRecommendationsForCandidate, scoreJob };