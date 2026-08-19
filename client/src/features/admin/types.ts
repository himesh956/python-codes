export interface PlatformOverview {
  totalCandidates: number;
  totalEmployers: number;
  activeEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
}

export interface SummaryCards {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  averageCTC: number;
  placementRatePercent: number;
}

export interface AdminDashboardData {
  summary: SummaryCards;
  applicationsOverTime: { date: string; count: number }[];
  funnel: { stage: string; count: number }[];
  jobTypeDistribution: { employmentType: string; count: number }[];
  workModeDistribution: { workMode: string; count: number }[];
}

export interface AdminUser {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminJob {
  _id: string;
  title: string;
  status: string;
  company: { name: string };
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  actor: { email: string; role: string };
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}