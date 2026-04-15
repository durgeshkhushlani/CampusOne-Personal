import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classroom/classrooms", form);
      setShowCreate(false);
      setForm({ name: "", section: "", subject: "", description: "" });
      fetchClassrooms();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classroom/classrooms/join", { code: joinCode });
      setShowJoin(false);
      setJoinCode("");
      fetchClassrooms();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will remove all enrollments, posts, and submissions.`)) return;
    try {
      await api.delete(`/classroom/classrooms/${id}`);
      fetchClassrooms();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === "admin" ? "📚 All Classrooms (Admin)" : "📚 My Classrooms"}
        </h1>
        <div className="flex gap-2">
          {(user?.role === "faculty" || user?.role === "admin") && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Create Class</button>
          )}
          {user?.role === "student" && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowJoin(true)}>🔗 Join Class</button>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create Classroom</h3>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <input className="input input-bordered w-full" placeholder="Class name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input input-bordered w-full" placeholder="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
              <input className="input input-bordered w-full" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Join Classroom</h3>
            <form onSubmit={handleJoin} className="space-y-3 mt-4">
              <input className="input input-bordered w-full" placeholder="Enter class code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required />
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowJoin(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Join</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classroom Grid */}
      {classrooms.length === 0 ? (
        <div className="alert alert-info">
          <span>
            {user?.role === "admin"
              ? "No classrooms exist yet."
              : user?.role === "faculty"
              ? "No classrooms yet. Create one!"
              : "No classrooms yet. Join one using a code!"}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((cls) => (
            <div key={cls._id} className="card shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-base-300 overflow-hidden">
              <Link to={`/classroom/${cls._id}`}>
                <div className="h-24 w-full" style={{ backgroundColor: cls.themeColor || "#1967d2" }}>
                  <div className="p-4 text-white">
                    <h2 className="font-bold text-lg truncate">{cls.name}</h2>
                    <p className="text-sm opacity-80">{cls.section || ""} {cls.subject ? `· ${cls.subject}` : ""}</p>
                  </div>
                </div>
                <div className="card-body p-4">
                  <p className="text-sm text-base-content/60">Faculty: {cls.faculty_name}</p>
                  <p className="text-xs text-base-content/40">{cls.student_count} students · Code: {cls.code}</p>
                </div>
              </Link>
              {/* Admin: Delete button */}
              {user?.role === "admin" && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => handleDelete(cls._id, cls.name)}
                    className="btn btn-error btn-xs btn-outline w-full"
                  >
                    🗑️ Delete Classroom
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
