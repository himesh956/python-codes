export interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    location: { city: string };
    employmentType: string;
    workMode: string;
    status: string;
  };
  company?: { name: string; logoUrl?: string };
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED" | "WITHDRAWN";
  statusHistory: { status: string; changedAt: string; note?: string }[];
  appliedAt: string;
}