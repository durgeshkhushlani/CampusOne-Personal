import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Dashboard — post-login landing page with role-appropriate module cards.
 */

const MODULE_CARDS = [
  {
    title: "ERP Portal",
    description: "Student records, attendance, courses, fees, and timetable management.",
    icon: "📋",
    path: "/erp",
    color: "from-blue-500 to-cyan-500",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "Classroom",
    description: "Virtual classrooms, assignments, materials, and submissions.",
    icon: "📚",
    path: "/classroom",
    color: "from-emerald-500 to-teal-500",
    roles: ["student", "faculty", "admin"],
  },
  {
    title: "HireSphere",
    description: "Campus placement portal — browse companies and apply for roles.",
    icon: "💼",
    path: "/hiresphere",
    color: "from-purple-500 to-pink-500",
    roles: ["student", "admin"],
  },
  {
    title: "CodeStage",
    description: "LeetCode-style coding practice — solve problems and track progress.",
    icon: "💻",
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
          <h1 className="text-3xl font-bold text-base-content">
            Welcome back, {user?.name || "User"} 👋
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
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-md`}
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
            <h3 className="font-semibold text-base-content/80">📌 Quick Info</h3>
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
