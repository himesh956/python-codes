import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import RoleRedirect from "@/routes/RoleRedirect";
import { DashboardLayout } from "@/layouts/DashboardLayout";

import LandingPage from "@/features/landing/pages/LandingPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import CandidateDashboardPage from "@/features/candidate/pages/CandidateDashboardPage";
import ProfilePage from "@/features/candidate/pages/ProfilePage";
import SavedJobsPage from "@/features/candidate/pages/SavedJobsPage";
import ApplicationsPage from "@/features/candidate/pages/ApplicationsPage";
import JobSearchPage from "@/features/jobs/pages/JobSearchPage";
import JobDetailPage from "@/features/jobs/pages/JobDetailPage";

import EmployerDashboardPage from "@/features/employer/pages/EmployerDashboardPage";
import PostJobPage from "@/features/employer/pages/PostJobPage";
import VoiceJobPostPage from "@/features/employer/pages/VoiceJobPostPage";
import JobPosterPage from "@/features/employer/pages/JobPosterPage";
import MyJobsPage from "@/features/employer/pages/MyJobsPage";
import ApplicantsPage from "@/features/employer/pages/ApplicantsPage";
import CompanyProfilePage from "@/features/employer/pages/CompanyProfilePage";

import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminAnalyticsPage from "@/features/admin/pages/AdminAnalyticsPage";
import WorkerAnalyticsPage from "@/features/admin/pages/WorkerAnalyticsPage";
import ManageUsersPage from "@/features/admin/pages/ManageUsersPage";
import ModerateJobsPage from "@/features/admin/pages/ModerateJobsPage";
import AuditLogsPage from "@/features/admin/pages/AuditLogsPage";
import DisputesPage from "@/features/admin/pages/DisputesPage";
import ReportsPage from "@/features/admin/pages/ReportsPage";

import WorkerSearchPage from "@/features/workers/pages/WorkerSearchPage";
import WorkerProfilePage from "@/features/workers/pages/WorkerProfilePage";
import BookWorkerPage from "@/features/bookings/pages/BookWorkerPage";
import MyBookingsPage from "@/features/bookings/pages/MyBookingsPage";
import BookingDetailPage from "@/features/bookings/pages/BookingDetailPage";

import WorkerOnboardingPage from "@/features/workerDashboard/pages/WorkerOnboardingPage";
import WorkerDashboardPage from "@/features/workerDashboard/pages/WorkerDashboardPage";
import WorkerJobHistoryPage from "@/features/workerDashboard/pages/WorkerJobHistoryPage";

import ConversationListPage from "@/features/chat/pages/ConversationListPage";
import ChatThreadPage from "@/features/chat/pages/ChatThreadPage";

/**
 * Per Phase 12 of the revised brief — the employer homepage should
 * have "only a few major actions." This trims what had grown to 8
 * items back down to 6: worker-marketplace features (bookings,
 * messages) already fold naturally into these; secondary pages
 * (voice-post, poster, company profile) are reachable FROM these
 * primary destinations rather than needing their own top-level slot.
 */
const candidateNav = [
  { label: "Find Jobs", to: "/candidate/jobs" },
  { label: "Find Local Work", to: "/customer/workers" },
  { label: "My Applications", to: "/candidate/applications" },
  { label: "Bookings", to: "/customer/bookings" },
  { label: "Messages", to: "/chat" },
  { label: "Profile", to: "/candidate/profile" },
];

const employerNav = [
  { label: "Post a Job", to: "/employer/jobs/create" },
  { label: "Find Workers", to: "/customer/workers" },
  { label: "My Jobs", to: "/employer/jobs" },
  { label: "Messages", to: "/chat" },
  { label: "Bookings", to: "/customer/bookings" },
  { label: "Profile", to: "/employer/profile" },
];

const adminNav = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Jobs", to: "/admin/jobs" },
  { label: "Disputes & Reports", to: "/admin/disputes" },
  { label: "Analytics", to: "/admin/analytics" },
  { label: "Audit Logs", to: "/admin/audit-logs" },
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/redirect" element={<RoleRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={["CANDIDATE"]} />}>
            <Route element={<DashboardLayout navItems={candidateNav} roleLabel="Candidate" />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
              <Route path="/candidate/jobs" element={<JobSearchPage />} />
              <Route path="/candidate/jobs/:id" element={<JobDetailPage />} />
              <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/candidate/applications" element={<ApplicationsPage />} />
              <Route path="/candidate/profile" element={<ProfilePage />} />
              <Route path="/customer/workers" element={<WorkerSearchPage />} />
              <Route path="/customer/workers/:id" element={<WorkerProfilePage />} />
              <Route path="/customer/book/:workerId" element={<BookWorkerPage />} />
              <Route path="/customer/bookings" element={<MyBookingsPage />} />
              <Route path="/customer/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/worker/onboarding" element={<WorkerOnboardingPage />} />
              <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
              <Route path="/worker/history" element={<WorkerJobHistoryPage />} />
              <Route path="/worker/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/chat" element={<ConversationListPage />} />
              <Route path="/chat/:id" element={<ChatThreadPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["EMPLOYER"]} />}>
            <Route element={<DashboardLayout navItems={employerNav} roleLabel="Employer" />}>
              <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
              <Route path="/employer/jobs" element={<MyJobsPage />} />
              <Route path="/employer/jobs/create" element={<PostJobPage />} />
              <Route path="/employer/jobs/voice" element={<VoiceJobPostPage />} />
              <Route path="/employer/jobs/:id/poster" element={<JobPosterPage />} />
              <Route path="/employer/jobs/:jobId/applicants" element={<ApplicantsPage />} />
              <Route path="/employer/profile" element={<CompanyProfilePage />} />
              <Route path="/customer/workers" element={<WorkerSearchPage />} />
              <Route path="/customer/workers/:id" element={<WorkerProfilePage />} />
              <Route path="/customer/book/:workerId" element={<BookWorkerPage />} />
              <Route path="/customer/bookings" element={<MyBookingsPage />} />
              <Route path="/customer/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/worker/onboarding" element={<WorkerOnboardingPage />} />
              <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
              <Route path="/worker/history" element={<WorkerJobHistoryPage />} />
              <Route path="/worker/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/chat" element={<ConversationListPage />} />
              <Route path="/chat/:id" element={<ChatThreadPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<DashboardLayout navItems={adminNav} roleLabel="Admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/jobs" element={<ModerateJobsPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/worker-analytics" element={<WorkerAnalyticsPage />} />
              <Route path="/admin/disputes" element={<DisputesPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}