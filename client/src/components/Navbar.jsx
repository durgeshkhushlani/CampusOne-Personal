import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar — persistent navigation bar visible after login.
 * Shows/hides links based on user role.
 */

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["student", "faculty", "admin"] },
  { path: "/erp", label: "ERP", icon: "📋", roles: ["student", "faculty", "admin"] },
  { path: "/classroom", label: "Classroom", icon: "📚", roles: ["student", "faculty", "admin"] },
  { path: "/hiresphere", label: "HireSphere", icon: "💼", roles: ["student", "admin"] },
  { path: "/codestage", label: "CodeStage", icon: "💻", roles: ["student", "admin"] },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <nav className="navbar bg-base-100 shadow-md border-b border-base-300 px-4 sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span>
            Campus<span className="text-primary">One</span>
          </span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="navbar-end gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold">{user?.name}</span>
          <span className="text-xs text-base-content/50 capitalize">{user?.role}</span>
        </div>

        {/* Mobile drawer */}
        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
            {visibleItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-base-300 pt-2">
              <button onClick={handleLogout} className="text-error">
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>

        <button
          id="logout-btn"
          className="btn btn-outline btn-sm btn-error hidden lg:flex"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
