import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

/**
 * ERP Module Landing — redirects to role-specific ERP dashboard.
 */
export default function ErpLanding() {
  const { user } = useAuth();

  const roleRoutes = {
    student: "/erp/student",
    faculty: "/erp/faculty",
    admin: "/erp/admin",
  };

  return <Navigate to={roleRoutes[user?.role] || "/dashboard"} replace />;
}
