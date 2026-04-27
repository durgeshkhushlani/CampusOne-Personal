import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { Code2, Search, CheckCircle2, Circle, Trophy, Plus, Edit2, Trash2 } from "lucide-react";

const DIFF_STYLE = {
  easy:   { bg: "#EDF7F2", color: "#3D7A62" },
  medium: { bg: "#FBF6EE", color: "#8B6914" },
  hard:   { bg: "#FBF0F0", color: "#9B4444" },
};

export default function Problems() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const fetchProblems = () => api.get("/codestage/problems").then(r => setProblems(r.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetchProblems(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/codestage/problems/${id}`); fetchProblems(); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  const filtered = problems.filter(p =>
    p.title.toLowerCase().includes(searchText.toLowerCase()) &&
    (difficultyFilter === "all" || p.difficulty === difficultyFilter)
  );

  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.isSolved).length;
  const easySolved = problems.filter(p => p.difficulty === "easy" && p.isSolved).length;
  const easyTotal = problems.filter(p => p.difficulty === "easy").length;
  const mediumSolved = problems.filter(p => p.difficulty === "medium" && p.isSolved).length;
  const mediumTotal = problems.filter(p => p.difficulty === "medium").length;
  const hardSolved = problems.filter(p => p.difficulty === "hard" && p.isSolved).length;
  const hardTotal = problems.filter(p => p.difficulty === "hard").length;

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#F7F6F2" }}><span className="loading loading-spinner loading-lg" style={{ color: "#5B8DB8" }}></span></div>;

  const StatBar = ({ label, solved, total, color }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#8A94A0", fontFamily: "'DM Mono', monospace" }}>{solved} / {total}</span>
      </div>
      <div style={{ height: 6, background: "#F0EEE8", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, borderRadius: 99, width: `${total === 0 ? 0 : (solved / total) * 100}%`, transition: "width 500ms ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2C3E50", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <Code2 size={20} color="#C17B7B" /> CodeStage
            </h1>
            <p style={{ fontSize: 13, color: "#8A94A0", margin: "4px 0 0" }}>Sharpen your algorithmic skills and track your progress</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/codestage/leaderboard"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, border: "1px solid #C8CDD5", background: "#FFFFFF", color: "#2C3E50", textDecoration: "none", transition: "all 150ms ease" }}
              onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
              onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
              <Trophy size={16} color="#B89B6B" /> Leaderboard
            </Link>
            {user?.role === "admin" && (
              <Link to="/codestage/problems/new"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, background: "#5B8DB8", color: "#FFFFFF", textDecoration: "none", transition: "all 150ms ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#4A7BA6"}
                onMouseLeave={e => e.currentTarget.style.background = "#5B8DB8"}>
                <Plus size={16} /> Add Problem
              </Link>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, padding: 20, marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
          <div style={{ flex: "0 0 140px" }}>
            <div style={{ fontSize: 11, color: "#8A94A0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Solved</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: "#2C3E50", lineHeight: 1 }}>{solvedProblems}</span>
              <span style={{ fontSize: 15, color: "#8A94A0" }}>/ {totalProblems}</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
            <StatBar label="Easy" solved={easySolved} total={easyTotal} color="#3D7A62" />
            <StatBar label="Medium" solved={mediumSolved} total={mediumTotal} color="#8B6914" />
            <StatBar label="Hard" solved={hardSolved} total={hardTotal} color="#9B4444" />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 300 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A94A0" }} />
            <input type="text"
              style={{ width: "100%", height: 40, border: "1px solid #D8D5CE", borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 14, color: "#2C3E50", background: "#FFFFFF", outline: "none", fontFamily: "inherit" }}
              placeholder="Search problems..."
              value={searchText} onChange={e => setSearchText(e.target.value)}
              onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 8, padding: 4 }}>
            {["all", "easy", "medium", "hard"].map(d => {
              const isActive = difficultyFilter === d;
              const col = d === "easy" ? "#3D7A62" : d === "medium" ? "#8B6914" : d === "hard" ? "#9B4444" : "#2C3E50";
              return (
                <button key={d} onClick={() => setDifficultyFilter(d)}
                  style={{ padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", textTransform: "capitalize", transition: "all 150ms ease", background: isActive ? (d === "all" ? "#5B8DB8" : DIFF_STYLE[d]?.bg) : "transparent", color: isActive ? (d === "all" ? "#FFFFFF" : col) : "#8A94A0" }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
          {problems.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#8A94A0" }}>No problems yet. {user?.role === "admin" ? "Add some!" : ""}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#8A94A0" }}>No problems match your filters.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAF8", borderBottom: "1px solid #E4E2DC" }}>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A94A0", textTransform: "uppercase", letterSpacing: "0.05em", width: 56, textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A94A0", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Title</th>
                  <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A94A0", textTransform: "uppercase", letterSpacing: "0.05em", width: 110 }}>Difficulty</th>
                  {user?.role === "admin" && <th style={{ padding: "12px 20px", width: 90 }}></th>}
                  <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A94A0", textTransform: "uppercase", letterSpacing: "0.05em", width: 80, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id}
                    style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAFAF8", borderBottom: "1px solid #F0EEE8", transition: "background 150ms ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#FAFAF8"}
                  >
                    <td style={{ padding: "0 20px", height: 48, textAlign: "center" }}>
                      {p.isSolved ? <CheckCircle2 size={18} color="#6BAE8E" style={{ margin: "0 auto" }} /> : <Circle size={18} color="#C8CDD5" style={{ margin: "0 auto" }} />}
                    </td>
                    <td style={{ padding: "0 20px", height: 48 }}>
                      <Link to={`/codestage/problems/${p._id}`} style={{ fontSize: 14, fontWeight: 500, color: "#2C3E50", textDecoration: "none", transition: "color 150ms ease" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#5B8DB8"}
                        onMouseLeave={e => e.currentTarget.style.color = "#2C3E50"}>
                        {i + 1}. {p.title}
                      </Link>
                    </td>
                    <td style={{ padding: "0 20px", height: 48 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: DIFF_STYLE[p.difficulty]?.bg, color: DIFF_STYLE[p.difficulty]?.color, textTransform: "capitalize" }}>
                        {p.difficulty}
                      </span>
                    </td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "0 20px", height: 48, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", opacity: 0 }} className="row-actions">
                          <button onClick={() => navigate(`/codestage/problems/${p._id}/edit`)} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#8A94A0", borderRadius: 6, transition: "all 150ms ease" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#EDF2F7"; e.currentTarget.style.color = "#5B8DB8"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#8A94A0"; }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.title)} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#8A94A0", borderRadius: 6, transition: "all 150ms ease" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#FBF0F0"; e.currentTarget.style.color = "#C17B7B"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#8A94A0"; }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                    <td style={{ padding: "0 20px", height: 48, textAlign: "right" }}>
                      <Link to={`/codestage/problems/${p._id}`} style={{ fontSize: 13, fontWeight: 500, color: "#5B8DB8", textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                        Solve
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <style>{`
          tr:hover .row-actions { opacity: 1 !important; }
        `}</style>
      </div>
    </div>
  );
}
