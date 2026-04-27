import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { ClipboardList, BookOpen, BarChart2, Calendar, CreditCard, FileText, User as UserIcon, Building, GraduationCap, Clock, Hash } from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/erp/students/me");
        setProfile(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#F7F6F2" }}>
      <span className="loading loading-spinner loading-lg" style={{ color: "#5B8DB8" }}></span>
    </div>
  );

  const getInitials = (first, last) => `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`;

  const linkStyle = {
    display: "flex", alignItems: "center", gap: 12, height: 44, padding: "0 16px",
    fontSize: 14, color: "#2C3E50", background: "#FFFFFF", border: "1px solid #E4E2DC",
    borderLeft: "1px solid #E4E2DC", borderRadius: 8, textDecoration: "none",
    transition: "all 150ms ease"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2C3E50", display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ClipboardList size={20} color="#5B8DB8" />
          ERP — Student Portal
        </h1>

        {profile ? (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Left 58% */}
            <div style={{ flex: "1 1 58%", minWidth: 300, background: "#FFFFFF", borderRadius: 14, border: "1px solid #E4E2DC", padding: 24, boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#5B8DB8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#2C3E50", margin: "0 0 4px" }}>
                  {profile.firstName} {profile.lastName}
                </h2>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#5B8DB8", background: "#EDF2F7", padding: "2px 12px", borderRadius: 99 }}>
                  Student
                </div>
              </div>

              <div style={{ height: 1, background: "#E4E2DC", marginBottom: 24 }} />

              <div style={{ border: "1px solid #E4E2DC", borderRadius: 8, overflow: "hidden" }}>
                {[
                  { icon: UserIcon, label: "Name", val: `${profile.firstName} ${profile.lastName}` },
                  { icon: Hash, label: "Enrollment", val: profile.enrollmentNo },
                  { icon: Building, label: "Department", val: profile.department },
                  { icon: GraduationCap, label: "Program", val: profile.program },
                  { icon: Clock, label: "Semester", val: profile.semester }
                ].map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: i % 2 === 0 ? "#FFFFFF" : "#FAFAF8", borderBottom: i < 4 ? "1px solid #E4E2DC" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "35%" }}>
                        <Icon size={15} color="#8A94A0" />
                        <span style={{ fontSize: 13, color: "#8A94A0" }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#2C3E50" }}>{row.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 42% */}
            <div style={{ flex: "1 1 38%", minWidth: 280, background: "#FFFFFF", borderRadius: 14, border: "1px solid #E4E2DC", padding: 24, boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#2C3E50", marginBottom: 16 }}>Quick Links</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { to: "/erp/student/courses", icon: BookOpen, label: "My Courses" },
                  { to: "/erp/student/attendance", icon: BarChart2, label: "Attendance" },
                  { to: "/erp/student/timetable", icon: Calendar, label: "Timetable" },
                  { to: "/erp/student/fees", icon: CreditCard, label: "Fees" },
                  { to: "/erp/student/exams", icon: FileText, label: "Exam Results" },
                  { to: "/erp/student/profile", icon: UserIcon, label: "My Profile" }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} style={linkStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F0F4F8"; e.currentTarget.style.borderLeft = "3px solid #5B8DB8"; e.currentTarget.style.paddingLeft = "14px"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderLeft = "1px solid #E4E2DC"; e.currentTarget.style.paddingLeft = "16px"; }}>
                      <Icon size={16} color="#8A94A0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ background: "#FBF0F0", color: "#C17B7B", padding: "16px 20px", borderRadius: 8, border: "1px solid #EDD5D5", fontSize: 14, fontWeight: 500 }}>
            No ERP profile found. Contact admin to set up your profile.
          </div>
        )}
      </div>
    </div>
  );
}
