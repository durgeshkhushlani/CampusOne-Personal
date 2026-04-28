import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { Briefcase, Search, Calendar, Plus } from "lucide-react";

export default function HireSphereDashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("All");

  const fetchData = async () => {
    try {
      const compRes = await api.get("/hiresphere/companies");
      setCompanies(compRes.data);
      if (user?.role === "student") {
        const appRes = await api.get("/hiresphere/applications/student");
        setApplications(appRes.data);
      }
      if (user?.role === "admin") {
        try { const s = await api.get("/hiresphere/stats"); setStats(s.data); } catch {}
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const hasApplied = (cid) => applications.some(a => a.companyId?._id === cid);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#F7F6F2" }}>
      <span className="loading loading-spinner loading-lg" style={{ color: "#5B8DB8" }}></span>
    </div>
  );

  const filteredCompanies = companies.filter(c => {
    const q = searchTerm.toLowerCase();
    const matches = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    const expired = new Date(c.lastDate) < new Date();
    const days = (new Date(c.lastDate) - new Date()) / 86400000;
    const soon = days >= 0 && days <= 7;
    if (filterTab === "Open") return matches && !expired;
    if (filterTab === "Deadline Soon") return matches && soon && !expired;
    return matches;
  });

  const btnPrimary = {
    display: "flex", alignItems: "center", gap: 6, background: "#5B8DB8",
    color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "9px 18px",
    borderRadius: 8, border: "none", cursor: "pointer", textDecoration: "none",
    transition: "all 150ms ease",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2C3E50", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <Briefcase size={20} color="#B89B6B" /> HireSphere
            </h1>
            <p style={{ fontSize: 13, color: "#8A94A0", margin: "4px 0 28px" }}>Browse open opportunities from recruiting companies</p>
          </div>
          {user?.role === "admin" && (
            <Link to="/hiresphere/create-company" style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.background = "#4A7BA6"}
              onMouseLeave={e => e.currentTarget.style.background = "#5B8DB8"}>
              <Plus size={16} /> Add Company
            </Link>
          )}
        </div>

        {/* Admin stats */}
        {user?.role === "admin" && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Companies", value: stats.totalCompanies, color: "#2C3E50" },
              { label: "Total Applications", value: stats.totalApplications, color: "#5B8DB8" },
              { label: "Students Selected", value: stats.totalSelected, color: "#6BAE8E" },
              { label: "Top Company", value: stats.topCompany?.name || "—", color: "#2C3E50", sub: stats.topCompany ? `${stats.topCompany.selectedCount} selected` : null },
            ].map(s => (
              <div key={s.label} style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
                <p style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontSize: typeof s.value === "number" ? 26 : 15, fontWeight: 600, color: s.color, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</p>
                {s.sub && <p style={{ fontSize: 12, color: "#8A94A0", margin: "2px 0 0" }}>{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Filter row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A94A0", pointerEvents: "none" }} />
            <input type="text"
              style={{ width: 280, height: 40, border: "1px solid #D8D5CE", borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 14, color: "#2C3E50", background: "#FFFFFF", outline: "none", fontFamily: "inherit", transition: "all 150ms ease" }}
              placeholder="Search companies or roles..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Open", "Deadline Soon"].map(tab => {
              const active = filterTab === tab;
              return (
                <button key={tab} onClick={() => setFilterTab(tab)}
                  style={{ padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer", border: active ? "1px solid #5B8DB8" : "1px solid #D8D5CE", background: active ? "#5B8DB8" : "#FFFFFF", color: active ? "#FFFFFF" : "#8A94A0", transition: "all 150ms ease" }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#F0F4F8"; e.currentTarget.style.color = "#2C3E50"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#8A94A0"; } }}>
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        {filteredCompanies.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, padding: 40, textAlign: "center", color: "#8A94A0" }}>
            No opportunities found.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {filteredCompanies.map(company => {
              const expired = new Date(company.lastDate) < new Date();
              const days = (new Date(company.lastDate) - new Date()) / 86400000;
              const soon = days >= 0 && days <= 7 && !expired;
              const applied = user?.role === "student" && hasApplied(company._id);
              return (
                <Link key={company._id} to={`/hiresphere/company/${company._id}`}
                  style={{
                    display: "flex", flexDirection: "column", background: "#FFFFFF",
                    border: "1px solid #E4E2DC",
                    borderLeft: soon ? "3px solid #B89B6B" : "1px solid #E4E2DC",
                    borderRadius: 14, padding: 20, textDecoration: "none",
                    boxShadow: "0 1px 4px rgba(44,62,80,0.06)", transition: "all 150ms ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(44,62,80,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(44,62,80,0.06)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{company.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {user?.role === "admin" && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
                              try {
                                await api.delete(`/hiresphere/companies/${company._id}`);
                                fetchData();
                              } catch (err) {
                                alert(err.response?.data?.message || "Failed to delete company");
                              }
                            }
                          }}
                          style={{
                            background: "none", border: "none", color: "#E06A6A", cursor: "pointer",
                            padding: "2px", display: "flex", alignItems: "center", fontSize: "14px"
                          }}
                          title="Delete Company"
                        >
                          🗑️
                        </button>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: expired ? "#FBF0F0" : "#EDF7F2", color: expired ? "#C17B7B" : "#3D7A62" }}>
                        {expired ? "Closed" : "Open"}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#5B8DB8", marginBottom: 10 }}>{company.role}</div>
                  <p style={{ fontSize: 13, color: "#8A94A0", lineHeight: 1.6, flexGrow: 1, margin: "0 0 14px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {company.description}
                  </p>
                  <div style={{ height: 1, background: "#E4E2DC", margin: "0 0 14px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: soon ? "#B89B6B" : "#8A94A0" }}>
                      <Calendar size={13} />
                      <span style={{ fontSize: 12 }}>{new Date(company.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    {user?.role === "student" ? (
                      <span style={{ fontSize: 13, fontWeight: 500, padding: "4px 12px", borderRadius: 8, border: applied ? "1px solid #6BAE8E" : "1px solid #C8CDD5", color: applied ? "#3D7A62" : "#8A94A0", background: applied ? "#EDF7F2" : "transparent" }}>
                        {applied ? "Applied" : "Apply"}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#5B8DB8" }}>View</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
