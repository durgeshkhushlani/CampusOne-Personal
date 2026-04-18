import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentProfile() {
  const { user } = useAuth();
  
  // Boilerplate data for now
  const [searchQuery, setSearchQuery] = useState("");
  
  const stats = {
    totalSolved: 124,
    easy: 60,
    medium: 50,
    hard: 14,
    totalEasy: 200,
    totalMedium: 300,
    totalHard: 100,
  };

  const recentSubmissions = [
    { id: 1, title: "Two Sum", difficulty: "easy", language: "cpp", date: "2 days ago", status: "Accepted" },
    { id: 2, title: "Longest Substring", difficulty: "medium", language: "python", date: "3 days ago", status: "Accepted" },
    { id: 3, title: "Median of Two Sorted Arrays", difficulty: "hard", language: "java", date: "1 week ago", status: "Wrong Answer" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-[calc(100vh-64px)]">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           {user?.name}'s Profile
        </h1>
        <div className="flex items-center gap-2">
           <div className="relative">
              <input 
                type="text" 
                placeholder="Search students..." 
                className="input input-bordered input-sm w-full max-w-xs pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <button className="btn btn-primary btn-sm">Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-base border-b pb-2">Problem Solving Stats</h2>
              
              <div className="flex items-center gap-4 py-4">
                 <div className="radial-progress text-primary" style={{"--value": Math.round((stats.totalSolved / (stats.totalEasy+stats.totalMedium+stats.totalHard)) * 100), "--size": "4rem", "--thickness": "4px"}} role="progressbar">
                    <span className="text-sm font-bold text-base-content">{stats.totalSolved}</span>
                 </div>
                 <div>
                    <p className="text-xs text-base-content/60">Total Solved</p>
                    <p className="font-semibold text-lg">{Math.round((stats.totalSolved / (stats.totalEasy+stats.totalMedium+stats.totalHard)) * 100)}%</p>
                 </div>
              </div>

              <div className="space-y-4 w-full mt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-success font-medium">Easy</span>
                    <span>{stats.easy} / {stats.totalEasy}</span>
                  </div>
                  <progress className="progress progress-success w-full" value={stats.easy} max={stats.totalEasy}></progress>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-warning font-medium">Medium</span>
                    <span>{stats.medium} / {stats.totalMedium}</span>
                  </div>
                  <progress className="progress progress-warning w-full" value={stats.medium} max={stats.totalMedium}></progress>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-error font-medium">Hard</span>
                    <span>{stats.hard} / {stats.totalHard}</span>
                  </div>
                  <progress className="progress progress-error w-full" value={stats.hard} max={stats.totalHard}></progress>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Submissions */}
        <div className="md:col-span-2">
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body p-0">
              <h2 className="card-title text-base p-6 pb-2">Recent Submissions</h2>
              
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map(sub => (
                      <tr key={sub.id}>
                        <td>
                          <div className="font-medium text-sm">{sub.title}</div>
                          <div className={`badge badge-xs mt-1 ${sub.difficulty === 'easy' ? 'badge-success' : sub.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                            {sub.difficulty}
                          </div>
                        </td>
                        <td><span className="badge badge-ghost badge-sm">{sub.language}</span></td>
                        <td>
                           <span className={`text-xs font-bold ${sub.status === 'Accepted' ? 'text-success' : 'text-error'}`}>
                             {sub.status}
                           </span>
                        </td>
                        <td className="text-xs text-base-content/60">{sub.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 pt-2 text-center border-t border-base-200">
                <Link to="/codestage" className="text-primary text-sm hover:underline font-medium">View all problems</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
