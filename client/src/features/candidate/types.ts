export interface CandidateProfile {
  _id: string;
  fullName: string;
  phone?: string;
  bio?: string;
  currentLocation?: { city: string; state?: string };
  preferredLocations: { city: string; state?: string }[];
  skills: string[];
  education: { institution: string; degree: string; fieldOfStudy?: string }[];
  experience: { company: string; title: string }[];
  expectedCTC?: number;
  noticePeriodDays?: number;
  resume?: { _id: string; cloudinaryUrl: string; fileName: string } | null;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  expectedCTC?: number;
  noticePeriodDays?: number;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}