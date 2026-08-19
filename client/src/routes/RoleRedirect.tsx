import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { dashboardPathForRole } from "./ProtectedRoute";

/**
 * Post-login/register landing spot. Reads the now-populated user from
 * context and bounces to the correct role dashboard — avoids each auth
 * page needing to know the full role -> path mapping itself.
 */
export default function RoleRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={dashboardPathForRole(user.role)} replace />;
}