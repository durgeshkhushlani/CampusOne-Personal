import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute — protects routes by checking for valid token.
 * Redirects to /login if not authenticated.
 * Optionally restricts by role(s).
 */
export default function PrivateRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check authorization
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
