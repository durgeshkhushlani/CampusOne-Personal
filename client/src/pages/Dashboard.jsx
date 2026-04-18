import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Dashboard — post-login landing page with role-appropriate module cards.
 */

const MODULE_CARDS = [
  {
    title: "ERP Portal",
    description: "Student records, attendance, courses, fees, and timetable management.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    path: "/erp",
    color: "from-blue-500 to-cyan-500",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "Classroom",
    description: "Virtual classrooms, assignments, materials, and submissions.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    path: "/classroom",
    color: "from-emerald-500 to-teal-500",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "HireSphere",
    description: "Campus placement portal — browse companies and apply for roles.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    path: "/hiresphere",
    color: "from-purple-500 to-pink-500",
    roles: ["student", "admin"],
  },
  {
    title: "CodeStage",
    description: "LeetCode-style coding practice — solve problems and track progress.",
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    path: "/codestage",
    color: "from-orange-500 to-red-500",
    roles: ["student", "admin"],
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const visibleCards = MODULE_CARDS.filter((card) => card.roles.includes(user?.role));

  const roleLabel = {
    student: "Student",
    faculty: "Faculty",
    admin: "Administrator",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-base-content/60 mt-1">
            Logged in as{" "}
            <span className="badge badge-primary badge-sm">{roleLabel[user?.role]}</span>
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {visibleCards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-300"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="card-title text-lg">{card.title}</h2>
                    <p className="text-base-content/60 text-sm mt-1">
                      {card.description}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-base-content/30 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Info */}
        <div className="mt-8 card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h3 className="font-semibold text-base-content/80 flex items-center gap-2">
              <svg className="w-5 h-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Quick Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="stat bg-base-200 rounded-xl p-4">
                <div className="stat-title text-xs">Email</div>
                <div className="stat-value text-sm font-medium">{user?.email}</div>
              </div>
              <div className="stat bg-base-200 rounded-xl p-4">
                <div className="stat-title text-xs">Role</div>
                <div className="stat-value text-sm font-medium capitalize">{user?.role}</div>
              </div>
              <div className="stat bg-base-200 rounded-xl p-4">
                <div className="stat-title text-xs">Platform</div>
                <div className="stat-value text-sm font-medium">CampusOne v1.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
