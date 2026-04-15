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
        <h1 className="text-2xl font-bold">💻 CodeStage — Problems</h1>
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
                      <span className="text-success font-bold">✓ Solved</span>
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
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => handleDelete(p._id, p.title)}
                        >
                          🗑️
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
