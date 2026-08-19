import { EmployerProfile, IEmployerProfile } from "../models/EmployerProfile";
import { Company, ICompany } from "../models/Company";
import { AppError } from "../utils/AppError";
import { UpdateEmployerProfileInput, UpdateCompanyInput } from "../validators/employer.validators";

async function getByUserId(userId: string): Promise<IEmployerProfile> {
  const profile = await EmployerProfile.findOne({ user: userId }).populate("company");
  if (!profile) {
    throw AppError.notFound("Employer profile not found");
  }
  return profile;
}

async function updateByUserId(
  userId: string,
  input: UpdateEmployerProfileInput
): Promise<IEmployerProfile> {
  const profile = await EmployerProfile.findOneAndUpdate(
    { user: userId },
    { $set: input },
    { new: true, runValidators: true }
  ).populate("company");
  if (!profile) {
    throw AppError.notFound("Employer profile not found");
  }
  return profile;
}

/**
 * Ownership check: an employer can only ever update the Company tied
 * to their own EmployerProfile. This is enforced here (not just by
 * hiding a UI button) so a direct API call from a different employer
 * account can never edit someone else's company — Part 21 requirement.
 */
async function updateMyCompany(userId: string, input: UpdateCompanyInput): Promise<ICompany> {
  const profile = await EmployerProfile.findOne({ user: userId });
  if (!profile) {
    throw AppError.notFound("Employer profile not found");
  }

  const company = await Company.findByIdAndUpdate(
    profile.company,
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!company) {
    throw AppError.notFound("Company not found");
  }
  return company;
}

export const employerService = { getByUserId, updateByUserId, updateMyCompany };
