import { CandidateProfile, ICandidateProfile } from "../models/CandidateProfile";
import { AppError } from "../utils/AppError";
import { UpdateCandidateProfileInput } from "../validators/candidate.validators";

async function getByUserId(userId: string): Promise<ICandidateProfile> {
  const profile = await CandidateProfile.findOne({ user: userId }).populate("resume");
  if (!profile) {
    throw AppError.notFound("Candidate profile not found");
  }
  return profile;
}

async function updateByUserId(
  userId: string,
  input: UpdateCandidateProfileInput
): Promise<ICandidateProfile> {
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!profile) {
    throw AppError.notFound("Candidate profile not found");
  }
  return profile;
}

/**
 * Simple weighted completion score used by the candidate dashboard
 * ("Profile completion: 70%"). Not persisted — computed on read so it
 * never drifts out of sync with the actual profile data.
 */
function computeProfileCompletion(profile: ICandidateProfile): number {
  const checks: boolean[] = [
    Boolean(profile.fullName),
    Boolean(profile.phone),
    Boolean(profile.bio),
    Boolean(profile.currentLocation),
    profile.preferredLocations.length > 0,
    profile.skills.length > 0,
    profile.education.length > 0,
    profile.experience.length > 0 || profile.projects.length > 0,
    Boolean(profile.expectedCTC),
    Boolean(profile.resume),
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export const candidateService = { getByUserId, updateByUserId, computeProfileCompletion };
