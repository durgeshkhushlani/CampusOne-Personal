import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { Link2, GraduationCap, Users, Plus, Trash2, BookOpen } from "lucide-react";

const BAND_COLORS = ["#5B8DB8", "#6BAE8E", "#8B8DB8", "#B89B6B", "#7BA8C0"];

const inputStyle = {
  width: "100%", height: 40, border: "1px solid #D8D5CE",
  borderRadius: 8, padding: "0 12px", fontSize: 14,
  color: "#2C3E50", background: "#FFFFFF", outline: "none",
  fontFamily: "inherit", transition: "all 150ms ease",
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(44,62,80,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
    <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(44,62,80,0.16)" }}>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#2C3E50", marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  </div>
);

export default function ClassroomDashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ name: "", section: "", subject: "", description: "" });
  const [joinCode, setJoinCode] = useState("");

  const fetchClassrooms = async () => {
    try {
      const res = await api.get("/classroom/classrooms");
      setClassrooms(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classroom/classrooms", form);
      setShowCreate(false); setForm({ name: "", section: "", subject: "", description: "" });
      fetchClassrooms();
    } catch (err) { alert(err.response?.data?.error || "Failed to create"); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classroom/classrooms/join", { code: joinCode });
      setShowJoin(false); setJoinCode(""); fetchClassrooms();
    } catch (err) { alert(err.response?.data?.error || "Failed to join"); }
  };

  const handleDelete = async (id, name, e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${name}"? This removes all enrollments, posts, and submissions.`)) return;
    try { await api.delete(`/classroom/classrooms/${id}`); fetchClassrooms(); }
    catch (err) { alert(err.response?.data?.error || "Failed to delete"); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#F7F6F2" }}><span className="loading loading-spinner loading-lg" style={{ color: "#5B8DB8" }}></span></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2C3E50", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <BookOpen size={20} color="#6BAE8E" />
              {user?.role === "admin" ? "All Classrooms" : "My Classrooms"}
            </h1>
            <p style={{ fontSize: 13, color: "#8A94A0", margin: "4px 0 0" }}>Your enrolled courses and materials</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(user?.role === "faculty" || user?.role === "admin") && (
              <button onClick={() => setShowCreate(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#5B8DB8", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 150ms ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#4A7BA6"}
                onMouseLeave={e => e.currentTarget.style.background = "#5B8DB8"}>
                <Plus size={16} /> Create Class
              </button>
            )}
            {user?.role === "student" && (
              <button onClick={() => setShowJoin(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#5B8DB8", color: "#FFFFFF", fontSize: 14, fontWeight: 500, padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 150ms ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#4A7BA6"}
                onMouseLeave={e => e.currentTarget.style.background = "#5B8DB8"}>
                <Link2 size={16} /> Join Class
              </button>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <Modal title="Create Classroom" onClose={() => setShowCreate(false)}>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inputStyle} placeholder="Class name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }} onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }} />
              <input style={inputStyle} placeholder="Section" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }} onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }} />
              <input style={inputStyle} placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }} onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }} />
              <textarea style={{ ...inputStyle, height: 80, padding: 12, resize: "none" }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }} onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "8px 16px", fontSize: 14, color: "#8A94A0", background: "none", border: "1px solid #C8CDD5", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", fontSize: 14, background: "#5B8DB8", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>Create</button>
              </div>
            </form>
          </Modal>
        )}

        {/* Join Modal */}
        {showJoin && (
          <Modal title="Join Classroom" onClose={() => setShowJoin(false)}>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inputStyle} placeholder="Enter class code" value={joinCode} onChange={e => setJoinCode(e.target.value)} required onFocus={e => { e.target.style.borderColor = "#5B8DB8"; e.target.style.boxShadow = "0 0 0 3px rgba(91,141,184,0.12)"; }} onBlur={e => { e.target.style.borderColor = "#D8D5CE"; e.target.style.boxShadow = "none"; }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowJoin(false)} style={{ padding: "8px 16px", fontSize: 14, color: "#8A94A0", background: "none", border: "1px solid #C8CDD5", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", fontSize: 14, background: "#5B8DB8", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>Join</button>
              </div>
            </form>
          </Modal>
        )}

        {/* Grid */}
        {classrooms.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, padding: 40, textAlign: "center", color: "#8A94A0", boxShadow: "0 1px 4px rgba(44,62,80,0.06)" }}>
            {user?.role === "admin" ? "No classrooms exist yet." : user?.role === "faculty" ? "No classrooms yet — create one!" : "No classrooms yet — join one with a code!"}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {classrooms.map((cls, index) => {
              const bandColor = BAND_COLORS[index % BAND_COLORS.length];
              return (
                <Link to={`/classroom/${cls._id}`} key={cls._id}
                  style={{ display: "flex", flexDirection: "column", background: "#FFFFFF", border: "1px solid #E4E2DC", borderRadius: 14, overflow: "hidden", textDecoration: "none", boxShadow: "0 1px 4px rgba(44,62,80,0.06)", transition: "all 150ms ease" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(44,62,80,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#5B8DB8"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(44,62,80,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E4E2DC"; }}
                >
                  {/* Color band */}
                  <div style={{ height: 72, background: bandColor, padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.name}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cls.section || ""}{cls.subject ? ` · ${cls.subject}` : ""}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 16, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <GraduationCap size={13} color="#8A94A0" />
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#2C3E50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.faculty_name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Users size={13} color="#8A94A0" />
                        <span style={{ fontSize: 13, color: "#8A94A0" }}>{cls.student_count || 0} students</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#F7F6F2", border: "1px solid #E4E2DC", color: "#8A94A0", padding: "2px 8px", borderRadius: 6 }}>
                        {cls.code}
                      </span>
                      {user?.role === "admin" && (
                        <button onClick={(e) => handleDelete(cls._id, cls.name, e)}
                          style={{ color: "#C17B7B", border: "1px solid #EDD5D5", background: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 150ms ease" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FBF0F0"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
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
