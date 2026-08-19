export interface JobLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface JobCompany {
  _id: string;
  name: string;
  logoUrl?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  workMode: "ON_SITE" | "HYBRID" | "REMOTE";
  location: JobLocation;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experienceMinYears: number;
  experienceMaxYears?: number;
  status: string;
  company: JobCompany;
  createdAt: string;
}

export interface JobSearchFilters {
  q?: string;
  city?: string;
  skills?: string;
  employmentType?: string;
  workMode?: string;
  sort?: "latest" | "salary_desc" | "salary_asc";
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}