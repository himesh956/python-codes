export interface EmployerProfile {
  _id: string;
  fullName: string;
  designation?: string;
  phone?: string;
  company: Company;
}

export interface Company {
  _id: string;
  name: string;
  logoUrl?: string;
  about?: string;
  industry?: string;
  website?: string;
  locations: { city: string; state?: string }[];
}

export interface CreateJobPayload {
  title: string;
  description: string;
  skills: string[];
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  workMode: "ON_SITE" | "HYBRID" | "REMOTE";
  location: { city: string; state?: string };
  salaryMin?: number;
  salaryMax?: number;
  experienceMinYears: number;
  openings: number;
}

export interface EmployerJob {
  _id: string;
  title: string;
  status: string;
  employmentType: string;
  workMode: string;
  location: { city: string };
  salaryMin?: number;
  salaryMax?: number;
  viewCount: number;
  createdAt: string;
}

export interface Applicant {
  _id: string;
  candidate: {
    _id: string;
    fullName: string;
    skills: string[];
    expectedCTC?: number;
    photoUrl?: string;
  };
  resume: { cloudinaryUrl: string; fileName: string };
  status: string;
  appliedAt: string;
}