import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/codestage/leaderboard")
      .then((res) => setLeaderboard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏆 CodeStage Leaderboard
        </h1>
        <Link to="/codestage" className="btn btn-ghost btn-sm">← Back to Problems</Link>
      </div>

      {leaderboard.length === 0 ? (
        <div className="alert alert-info"><span>No submissions yet. Be the first to solve a problem!</span></div>
      ) : (
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="w-16">Rank</th>
                    <th>Name</th>
                    <th className="text-right">Problems Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.userId === user?.userId || entry.userId === user?._id;
                    return (
                      <tr
                        key={entry.userId}
                        className={isCurrentUser ? "bg-primary/10 font-bold" : "hover"}
                      >
                        <td>
                          <span className={`text-lg ${entry.rank === 1 ? "text-warning" : entry.rank === 2 ? "text-base-content/60" : entry.rank === 3 ? "text-orange-400" : ""}`}>
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium">{entry.name}</span>
                          {isCurrentUser && <span className="badge badge-primary badge-xs ml-2">You</span>}
                        </td>
                        <td className="text-right">
                          <span className="font-mono font-bold text-primary">{entry.solvedCount}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
