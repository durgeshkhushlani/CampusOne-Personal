import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, ClipboardList, BookOpen, Briefcase, Code2, LogOut, Menu } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student", "faculty", "admin"] },
  { path: "/erp", label: "ERP", icon: ClipboardList, roles: ["student", "faculty", "admin"] },
  { path: "/classroom", label: "Classroom", icon: BookOpen, roles: ["student", "faculty", "admin"] },
  { path: "/hiresphere", label: "HireSphere", icon: Briefcase, roles: ["student", "admin"] },
  { path: "/codestage", label: "CodeStage", icon: Code2, roles: ["student", "admin"] },
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
    <nav style={{ height: "56px", background: "#FFFFFF", borderBottom: "1px solid #E4E2DC" }}
      className="px-6 sticky top-0 z-50 flex items-center justify-between">

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2">
        <div style={{ width: 20, height: 20, background: "#5B8DB8", borderRadius: 4 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#2C3E50" }}>CampusOne</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-1 h-full">
        {visibleItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? "#2C3E50" : "#8A94A0",
                background: isActive ? "#EDF2F7" : "transparent",
                borderRadius: 8,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderBottom: isActive ? "2px solid #5B8DB8" : "2px solid transparent",
                transition: "all 150ms ease",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#EDF2F7"; e.currentTarget.style.color = "#2C3E50"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A94A0"; }}}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50" }}>{user?.name}</span>
          <span style={{ fontSize: 11, background: "#EEF3F9", color: "#5B8DB8", borderRadius: 99, padding: "1px 8px", fontWeight: 500, textTransform: "capitalize" }}>
            {user?.role}
          </span>
        </div>

        {/* Mobile dropdown */}
        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-sm px-1">
            <Menu size={20} style={{ color: "#2C3E50" }} />
          </label>
          <ul tabIndex={0} style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 12, minWidth: 200, boxShadow: "0 4px 16px rgba(44,62,80,0.10)" }}
            className="dropdown-content menu p-2 mt-4 z-50">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link to={item.path} style={{ fontSize: 14, color: "#2C3E50" }} className="flex items-center gap-2 py-2">
                    <Icon size={16} /> {item.label}
                  </Link>
                </li>
              );
            })}
            <li style={{ borderTop: "1px solid #E4E2DC", marginTop: 8, paddingTop: 8 }}>
              <button onClick={handleLogout} style={{ color: "#C17B7B" }} className="flex items-center gap-2 py-2 text-sm">
                <LogOut size={16} /> Log out
              </button>
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          style={{ fontSize: 13, fontWeight: 500, color: "#8A94A0", border: "1px solid #C8CDD5", background: "transparent", borderRadius: 8, padding: "6px 12px", transition: "all 150ms ease" }}
          className="hidden lg:flex items-center gap-2"
          onMouseEnter={e => { e.currentTarget.style.background = "#F0F4F8"; e.currentTarget.style.color = "#2C3E50"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8A94A0"; }}
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </nav>
  );
}
