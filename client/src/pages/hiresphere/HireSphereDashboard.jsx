import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function HireSphereDashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compRes = await api.get("/hiresphere/companies");
        setCompanies(compRes.data);

        // Fetch student's own applications
        if (user?.role === "student") {
          const appRes = await api.get("/hiresphere/applications/student");
          setApplications(appRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Check if student has applied to a company
  const hasApplied = (companyId) => {
    return applications.some((app) => app.companyId?._id === companyId);
  };

  // Split companies for student view
  const appliedCompanies = companies.filter((c) => hasApplied(c._id));
  const openCompanies = companies.filter((c) => !hasApplied(c._id));

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          HireSphere — Campus Placements
        </h1>
        {user?.role === "admin" && (
          <Link to="/hiresphere/create-company" className="btn btn-primary btn-sm">
            + Add Company
          </Link>
        )}
      </div>

      {/* ─── Student: Applied Companies Section ─── */}
      {user?.role === "student" && appliedCompanies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-success flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Applied Companies ({appliedCompanies.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliedCompanies.map((company) => {
              const app = applications.find((a) => a.companyId?._id === company._id);
              return (
                <Link
                  key={company._id}
                  to={`/hiresphere/company/${company._id}`}
                  className="card bg-success/5 shadow-lg border-2 border-success/30 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="card-body">
                    <h2 className="card-title text-base">{company.name}</h2>
                    <p className="text-sm text-primary font-medium">{company.role}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-base-content/40">
                        Applied: {new Date(app?.createdAt).toLocaleDateString()}
                      </span>
                      <span className="badge badge-success badge-sm border-0 font-medium">Applied</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Company Listings ─── */}
      <div>
        {user?.role === "student" && appliedCompanies.length > 0 && (
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Open Companies ({openCompanies.length})
          </h2>
        )}

        {(user?.role === "student" ? openCompanies : companies).length === 0 ? (
          <div className="alert alert-info">
            <span>
              {user?.role === "admin"
                ? "No companies listed yet. Add some!"
                : appliedCompanies.length > 0
                ? "You've applied to all available companies!"
                : "No companies listed yet. Check back later."}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(user?.role === "student" ? openCompanies : companies).map((company) => {
              const isExpired = new Date(company.lastDate) < new Date();
              return (
                <Link
                  key={company._id}
                  to={`/hiresphere/company/${company._id}`}
                  className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="card-body">
                    <h2 className="card-title text-base">{company.name}</h2>
                    <p className="text-sm text-primary font-medium">{company.role}</p>
                    <p className="text-sm text-base-content/60 line-clamp-2">{company.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-base-content/40">
                        Deadline: {new Date(company.lastDate).toLocaleDateString()}
                      </span>
                      <span className={`badge badge-sm ${isExpired ? "badge-error" : "badge-success"}`}>
                        {isExpired ? "Closed" : "Open"}
                      </span>
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
