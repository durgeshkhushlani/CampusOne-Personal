import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipboardList, BookOpen, Briefcase, Code2, ArrowRight } from "lucide-react";

const MODULE_CARDS = [
  {
    title: "ERP Portal",
    description: "Student records, attendance, courses, fees, and timetable management.",
    icon: ClipboardList,
    path: "/erp",
    iconBg: "#EDF2F7",
    iconColor: "#5B8DB8",
    borderColor: "#5B8DB8",
    tagLine: "Manage academic records",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "Classroom",
    description: "Virtual classrooms, assignments, materials, and submissions.",
    icon: BookOpen,
    path: "/classroom",
    iconBg: "#EDF7F2",
    iconColor: "#6BAE8E",
    borderColor: "#6BAE8E",
    tagLine: "Access course materials",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "HireSphere",
    description: "Campus placement portal — browse companies and apply for roles.",
    icon: Briefcase,
    path: "/hiresphere",
    iconBg: "#FBF6EE",
    iconColor: "#B89B6B",
    borderColor: "#B89B6B",
    tagLine: "Explore opportunities",
    roles: ["student", "admin"],
  },
  {
    title: "CodeStage",
    description: "LeetCode-style coding practice — solve problems and track progress.",
    icon: Code2,
    path: "/codestage",
    iconBg: "#FBF0F0",
    iconColor: "#C17B7B",
    borderColor: "#C17B7B",
    tagLine: "Practice coding",
    roles: ["student", "admin"],
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const visibleCards = MODULE_CARDS.filter(c => c.roles.includes(user?.role));

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#2C3E50", margin: 0 }}>
            Welcome back, {user?.name || "User"}
          </h1>
          <p style={{ fontSize: 14, color: "#8A94A0", margin: "6px 0 0" }}>
            Here's your campus at a glance
          </p>
        </div>



        {/* Module grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }} className="module-grid">
          {visibleCards.map(card => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#FFFFFF",
                  border: "1px solid #E4E2DC",
                  borderLeft: `3px solid ${card.borderColor}`,
                  borderRadius: 14,
                  padding: "24px",
                  boxShadow: "0 1px 4px rgba(44,62,80,0.06)",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(44,62,80,0.10)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = card.borderColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(44,62,80,0.06)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#E4E2DC";
                  e.currentTarget.style.borderLeftColor = card.borderColor;
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={card.iconColor} strokeWidth={2} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#2C3E50" }}>{card.title}</span>
                    <ArrowRight size={16} color="#8A94A0" />
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#8A94A0", lineHeight: 1.6, margin: "0 0 16px", flexGrow: 1 }}>
                  {card.description}
                </p>
                <div style={{ fontSize: 13, fontWeight: 500, color: card.borderColor }}>
                  {card.tagLine}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick info bar */}
        <div style={{
          marginTop: 28,
          background: "#FFFFFF",
          border: "1px solid #E4E2DC",
          borderRadius: 14,
          display: "grid",
          gridTemplateColumns: user?.role === "student" ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
          boxShadow: "0 1px 4px rgba(44,62,80,0.06)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "18px 24px", borderRight: "1px solid #E4E2DC" }}>
            <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
          {user?.role === "student" && (
            <>
              <div style={{ padding: "18px 24px", borderRight: "1px solid #E4E2DC" }}>
                <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Semester</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{user?.semester || "—"}</div>
              </div>
              <div style={{ padding: "18px 24px", borderRight: "1px solid #E4E2DC" }}>
                <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{user?.department || "—"}</div>
              </div>
              <div style={{ padding: "18px 24px" }}>
                <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Program</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{user?.program || "—"}</div>
              </div>
            </>
          )}
          {user?.role === "faculty" && (
            <div style={{ padding: "18px 24px" }}>
              <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50" }}>{user?.department || "—"}</div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 640px) {
            .module-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
