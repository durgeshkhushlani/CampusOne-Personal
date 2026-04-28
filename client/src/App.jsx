import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Core pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";

// ERP Module
import ErpLanding from "./pages/erp/ErpLanding";
import ErpStudentDashboard from "./pages/erp/student/StudentDashboard";
import StudentCourses from "./pages/erp/student/StudentCourses";
import StudentAttendance from "./pages/erp/student/StudentAttendance";
import StudentTimetable from "./pages/erp/student/StudentTimetable";
import StudentFees from "./pages/erp/student/StudentFees";
import FacultyDashboard from "./pages/erp/faculty/FacultyDashboard";
import FacultyCourses from "./pages/erp/faculty/FacultyCourses";
import MarkAttendance from "./pages/erp/faculty/MarkAttendance";
import FacultyTimetable from "./pages/erp/faculty/FacultyTimetable";
import ErpAdminDashboard from "./pages/erp/admin/AdminDashboard";
import StudentExams from "./pages/erp/student/StudentExams";
import ErpStudentProfile from "./pages/erp/student/StudentProfile";
import FacultyExams from "./pages/erp/faculty/FacultyExams";

// Classroom Module
import ClassroomDashboard from "./pages/classroom/ClassroomDashboard";
import ClassroomDetail from "./pages/classroom/ClassroomDetail";
import AssignmentDetail from "./pages/classroom/AssignmentDetail";

// HireSphere Module
import HireSphereDashboard from "./pages/hiresphere/HireSphereDashboard";
import CompanyDetail from "./pages/hiresphere/CompanyDetail";
import CreateCompany from "./pages/hiresphere/CreateCompany";

// CodeStage Module
import Problems from "./pages/codestage/Problems";
import ProblemDetail from "./pages/codestage/ProblemDetail";
import ProblemForm from "./pages/codestage/ProblemForm";
import StudentProfile from "./pages/codestage/StudentProfile";
import Leaderboard from "./pages/codestage/Leaderboard";

function GlobalControls() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
        className="btn btn-circle btn-primary shadow-lg" 
        title="Scroll to Top"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>
    </div>
  );
}

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  return (
    <button 
      onClick={() => navigate(-1)} 
      className="fixed top-[68px] left-4 z-[40] flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  );
}

/**
 * AppRoutes — handles routing for the entire unified CampusOne app.
 */
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/terms" element={<Terms />} />

      {/* Protected — Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* ======================== ERP Module ======================== */}
      <Route
        path="/erp"
        element={
          <PrivateRoute>
            <ErpLanding />
          </PrivateRoute>
        }
      />
      {/* ERP — Student */}
      <Route path="/erp/student" element={<PrivateRoute roles={["student"]}><ErpStudentDashboard /></PrivateRoute>} />
      <Route path="/erp/student/courses" element={<PrivateRoute roles={["student"]}><StudentCourses /></PrivateRoute>} />
      <Route path="/erp/student/attendance" element={<PrivateRoute roles={["student"]}><StudentAttendance /></PrivateRoute>} />
      <Route path="/erp/student/timetable" element={<PrivateRoute roles={["student"]}><StudentTimetable /></PrivateRoute>} />
      <Route path="/erp/student/fees" element={<PrivateRoute roles={["student"]}><StudentFees /></PrivateRoute>} />
      <Route path="/erp/student/exams" element={<PrivateRoute roles={["student"]}><StudentExams /></PrivateRoute>} />
      <Route path="/erp/student/profile" element={<PrivateRoute roles={["student"]}><ErpStudentProfile /></PrivateRoute>} />
      {/* ERP — Faculty */}
      <Route path="/erp/faculty" element={<PrivateRoute roles={["faculty"]}><FacultyDashboard /></PrivateRoute>} />
      <Route path="/erp/faculty/courses" element={<PrivateRoute roles={["faculty"]}><FacultyCourses /></PrivateRoute>} />
      <Route path="/erp/faculty/attendance" element={<PrivateRoute roles={["faculty"]}><MarkAttendance /></PrivateRoute>} />
      <Route path="/erp/faculty/timetable" element={<PrivateRoute roles={["faculty"]}><FacultyTimetable /></PrivateRoute>} />
      <Route path="/erp/faculty/exams" element={<PrivateRoute roles={["faculty"]}><FacultyExams /></PrivateRoute>} />
      {/* ERP — Admin */}
      <Route path="/erp/admin" element={<PrivateRoute roles={["admin"]}><ErpAdminDashboard /></PrivateRoute>} />

      {/* ======================== Classroom Module ======================== */}
      <Route path="/classroom" element={<PrivateRoute><ClassroomDashboard /></PrivateRoute>} />
      <Route path="/classroom/:id" element={<PrivateRoute><ClassroomDetail /></PrivateRoute>} />
      <Route path="/classroom/:id/assignment/:postId" element={<PrivateRoute><AssignmentDetail /></PrivateRoute>} />

      {/* ======================== HireSphere Module ======================== */}
      <Route path="/hiresphere" element={<PrivateRoute roles={["student", "admin"]}><HireSphereDashboard /></PrivateRoute>} />
      <Route path="/hiresphere/company/:id" element={<PrivateRoute roles={["student", "admin"]}><CompanyDetail /></PrivateRoute>} />
      <Route path="/hiresphere/create-company" element={<PrivateRoute roles={["admin"]}><CreateCompany /></PrivateRoute>} />

      {/* ======================== CodeStage Module ======================== */}
      <Route path="/codestage" element={<PrivateRoute roles={["student", "admin"]}><Problems /></PrivateRoute>} />
      <Route path="/codestage/leaderboard" element={<PrivateRoute roles={["student", "admin"]}><Leaderboard /></PrivateRoute>} />
      <Route path="/codestage/profile" element={<PrivateRoute roles={["student", "admin"]}><StudentProfile /></PrivateRoute>} />
      <Route path="/codestage/problems/new" element={<PrivateRoute roles={["admin"]}><ProblemForm /></PrivateRoute>} />
      <Route path="/codestage/problems/:id/edit" element={<PrivateRoute roles={["admin"]}><ProblemForm /></PrivateRoute>} />
      <Route path="/codestage/problems/:id" element={<PrivateRoute roles={["student", "admin"]}><ProblemDetail /></PrivateRoute>} />

      {/* Default + Catch-all */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <GlobalControls />
        <BackButton />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
