import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function CompanyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resume, setResume] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compRes = await api.get(`/hiresphere/companies/${id}`);
        setCompany(compRes.data);
        setAnswers((compRes.data.formQuestions || []).map((q) => ({ question: q, answer: "" })));

        // Check if student already applied
        if (user?.role === "student") {
          const appRes = await api.get("/hiresphere/applications/student");
          const applied = appRes.data.some((app) => app.companyId?._id === id);
          setHasApplied(applied);
        }

        // Admin: fetch applications for this company
        if (user?.role === "admin") {
          setLoadingApps(true);
          const appsRes = await api.get(`/hiresphere/applications/company/${id}`);
          setApplications(appsRes.data);
          setLoadingApps(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) return alert("Please upload your resume");
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("companyId", id);
      formData.append("resume", resume);
      formData.append("answers", JSON.stringify(answers));
      await api.post("/hiresphere/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Application submitted successfully!");
      navigate("/hiresphere");
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  const handleDownloadResumes = async () => {
    try {
      const res = await api.get(`/hiresphere/applications/company/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${company?.name?.replace(/\s+/g, "_")}_resumes.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("No resumes to download or download failed.");
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get(`/hiresphere/applications/company/${id}/export`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${company?.name?.replace(/\s+/g, "_")}_applications.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("No applications to export or export failed.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (!company)
    return (
      <div className="p-6">
        <div className="alert alert-error">Company not found.</div>
      </div>
    );

  const isExpired = new Date(company.lastDate) < new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Company Info Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body">
          <h1 className="card-title text-2xl">{company.name}</h1>
          <p className="text-primary font-semibold">{company.role}</p>
          <p className="text-base-content/70 mt-2 whitespace-pre-line">{company.description}</p>
          <div className="flex gap-4 mt-4">
            <span className="text-sm text-base-content/50">
              Deadline: {new Date(company.lastDate).toLocaleDateString()}
            </span>
            <span className={`badge ${isExpired ? "badge-error" : "badge-success"}`}>
              {isExpired ? "Closed" : "Open"}
            </span>
            {hasApplied && <span className="badge badge-info">✓ You have applied</span>}
          </div>
        </div>
      </div>

      {/* ─── Admin: View Applications ─── */}
      {user?.role === "admin" && (
        <div className="card bg-base-100 shadow-lg border border-base-300 mt-6">
          <div className="card-body">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="card-title text-lg">
                📄 Applications ({applications.length})
              </h2>
              {applications.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleExportExcel} className="btn btn-sm btn-outline btn-success">
                    📊 Export to Excel
                  </button>
                  <button onClick={handleDownloadResumes} className="btn btn-sm btn-outline btn-primary">
                    📥 Download Resumes
                  </button>
                </div>
              )}
            </div>

            {loadingApps ? (
              <span className="loading loading-spinner"></span>
            ) : applications.length === 0 ? (
              <p className="text-base-content/50 text-sm mt-2">No applications received yet.</p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Enrollment No</th>
                      <th>CGPA</th>
                      <th>Email</th>
                      <th>Applied On</th>
                      <th>Resume</th>
                      <th>Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, idx) => (
                      <tr key={app._id}>
                        <td>{idx + 1}</td>
                        <td className="font-medium">{app.studentId?.name || "N/A"}</td>
                        <td className="text-sm font-mono">{app.enrollmentNo || "N/A"}</td>
                        <td className="text-sm font-semibold">{app.cgpa || "N/A"}</td>
                        <td className="text-sm">{app.studentId?.email || "N/A"}</td>
                        <td className="text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          {app.resume ? (
                            <a
                              href={`/uploads/resumes/${app.resume}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-xs btn-ghost text-primary"
                            >
                              📎 View
                            </a>
                          ) : (
                            <span className="text-base-content/30 text-xs">N/A</span>
                          )}
                        </td>
                        <td>
                          {app.answers?.length > 0 ? (
                            <details className="collapse collapse-arrow bg-base-200 rounded-lg">
                              <summary className="collapse-title text-xs p-2 min-h-0">
                                View ({app.answers.length})
                              </summary>
                              <div className="collapse-content text-xs">
                                {app.answers.map((a, i) => (
                                  <div key={i} className="mb-2">
                                    <p className="font-semibold">{a.question}</p>
                                    <p className="text-base-content/70">{a.answer || "—"}</p>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <span className="text-base-content/30 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Student: Already Applied Notice ─── */}
      {user?.role === "student" && hasApplied && (
        <div className="alert alert-success mt-6 shadow-lg">
          <span>✅ You have already applied to this company. Your application is under review.</span>
        </div>
      )}

      {/* ─── Student: Apply Form ─── */}
      {user?.role === "student" && !isExpired && !hasApplied && (
        <form onSubmit={handleApply} className="card bg-base-100 shadow-lg border border-base-300 mt-6">
          <div className="card-body space-y-4">
            <h2 className="card-title text-lg">Apply Now</h2>

            {answers.map((a, i) => (
              <div key={i}>
                <label className="label">
                  <span className="label-text font-medium">{a.question}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={a.answer}
                  onChange={(e) => {
                    const up = [...answers];
                    up[i].answer = e.target.value;
                    setAnswers(up);
                  }}
                />
              </div>
            ))}

            <div>
              <label className="label">
                <span className="label-text font-medium">Resume (PDF/DOC)</span>
              </label>
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={applying}>
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
