import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Problems() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = () => {
    api.get("/codestage/problems")
      .then((res) => setProblems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProblems(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete problem "${title}"? This will also remove all submissions.`)) return;
    try {
      await api.delete(`/codestage/problems/${id}`);
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  const difficultyColor = { easy: "badge-success", medium: "badge-warning", hard: "badge-error" };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
           CodeStage — Problems
        </h1>
        {user?.role === "admin" && (
          <Link to="/codestage/problems/new" className="btn btn-primary btn-sm">+ Add Problem</Link>
        )}
      </div>

      {problems.length === 0 ? (
        <div className="alert alert-info"><span>No problems available yet. {user?.role === "admin" ? "Add some!" : ""}</span></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Status</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p._id} className="hover:bg-base-200">
                  <td>{i + 1}</td>
                  <td>
                    <Link to={`/codestage/problems/${p._id}`} className="link link-primary font-medium">
                      {p.title}
                    </Link>
                    {p.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {p.tags.map((tag, idx) => (
                          <span key={idx} className="badge badge-xs badge-ghost">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${difficultyColor[p.difficulty]}`}>{p.difficulty}</span>
                  </td>
                  <td>
                    {p.isSolved ? (
                      <span className="text-success font-bold flex items-center gap-1">
                        <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Solved
                      </span>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                  {user?.role === "admin" && (
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-xs btn-ghost text-info"
                          onClick={() => navigate(`/codestage/problems/${p._id}/edit`)}
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => handleDelete(p._id, p.title)}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
