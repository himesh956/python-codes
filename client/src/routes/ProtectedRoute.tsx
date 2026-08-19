import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Role } from "@/features/auth/types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Gate for role-restricted route trees. Unauthenticated -> /login.
 * Authenticated but wrong role -> redirected to their own dashboard
 * rather than shown a dead end.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "CANDIDATE":
      return "/candidate/dashboard";
    case "EMPLOYER":
      return "/employer/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
  }
}