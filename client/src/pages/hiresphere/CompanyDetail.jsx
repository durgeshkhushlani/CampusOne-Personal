import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  Briefcase, Calendar, Users, Download, FileSpreadsheet,
  CheckCircle, ArrowLeft, Link2, Upload, Building2, GraduationCap
} from "lucide-react";

const STATUS_CONFIG = {
  applied: { label: "Applied", cls: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", cls: "bg-amber-100 text-amber-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  selected: { label: "Selected", cls: "bg-green-100 text-green-700" },
};

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
  const [myApplication, setMyApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const fetchAll = async () => {
    try {
      const compRes = await api.get(`/hiresphere/companies/${id}`);
      setCompany(compRes.data);
      setAnswers((compRes.data.formQuestions || []).map((q) => ({ question: q, answer: "" })));

      if (user?.role === "student") {
        const appRes = await api.get("/hiresphere/applications/student");
        const appliedApp = appRes.data.find((app) => app.companyId?._id === id);
        if (appliedApp) {
          setHasApplied(true);
          setMyApplication(appliedApp);
        }
      }
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

  useEffect(() => { fetchAll(); }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) return alert("Please provide your resume");
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
      const res = await api.get(`/hiresphere/applications/company/${id}/download`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${company?.name?.replace(/\s+/g, "_")}_resumes.zip`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("No resumes to download or download failed."); }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get(`/hiresphere/applications/company/${id}/export`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${company?.name?.replace(/\s+/g, "_")}_applications.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("No applications to export or export failed."); }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.put(`/hiresphere/applications/${applicationId}/status`, { status: newStatus });
      const appsRes = await api.get(`/hiresphere/applications/company/${id}`);
      setApplications(appsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!company) return <div className="p-6"><div className="alert alert-error">Company not found.</div></div>;

  const isExpired = new Date(company.lastDate) < new Date();

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate("/hiresphere")}
          className="flex items-center gap-2 text-sm font-medium text-[#8A94A0] hover:text-[#2C3E50] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to HireSphere
        </button>

        {/* Company Header Card */}
        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-8 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-[12px] bg-[#F0F4F8] flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-[#5B8DB8]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#2C3E50]">{company.name}</h1>
                <p className="text-[#5B8DB8] font-semibold mt-1 text-base">{company.role}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {isExpired ? "Closed" : "Open for Applications"}
                  </span>
                  {hasApplied && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <CheckCircle className="w-3 h-3" /> Applied
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm text-[#8A94A0]">
                    <Calendar className="w-4 h-4" />
                    Deadline: {new Date(company.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-[#E4E2DC]">
            <p className="text-[#8A94A0] whitespace-pre-line leading-relaxed text-sm">{company.description}</p>
          </div>

          {/* Eligibility */}
          {company.minCGPA > 0 && (
            <div className="mt-5">
              <div className="inline-flex items-center gap-2 bg-[#F7F6F2] rounded-lg px-4 py-2.5 border border-[#E4E2DC]">
                <GraduationCap className="w-4 h-4 text-[#5B8DB8]" />
                <span className="text-sm font-medium text-[#2C3E50]">Min CGPA: <span className="text-[#5B8DB8] font-semibold">{company.minCGPA}</span></span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Admin: Applications Panel ─── */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="font-semibold text-[#2C3E50] text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8A94A0]" />
                Applications
                <span className="ml-1 text-sm font-semibold bg-[#F0F4F8] text-[#5B8DB8] px-2.5 py-0.5 rounded-full">{applications.length}</span>
              </h2>
              {applications.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[8px] border border-[#6BAE8E] text-[#6BAE8E] hover:bg-[#6BAE8E]/5 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                  </button>
                  <button onClick={handleDownloadResumes} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[8px] border border-[#5B8DB8] text-[#5B8DB8] hover:bg-[#5B8DB8]/5 transition-colors">
                    <Download className="w-4 h-4" /> Download Resumes
                  </button>
                </div>
              )}
            </div>

            {loadingApps ? (
              <div className="flex justify-center py-6"><span className="loading loading-spinner text-primary"></span></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 text-[#8A94A0] text-sm">No applications received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-[#8A94A0] uppercase tracking-wide border-b border-[#E4E2DC]">
                      <th className="pb-3 text-left pl-2">#</th>
                      <th className="pb-3 text-left">Student</th>
                      <th className="pb-3 text-left">Enrollment</th>
                      <th className="pb-3 text-left">Applied On</th>
                      <th className="pb-3 text-left">Status</th>
                      <th className="pb-3 text-left">Resume</th>
                      <th className="pb-3 text-left">Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, idx) => (
                      <tr key={app._id} className="border-b border-[#F7F6F2] hover:bg-[#F7F6F2] transition-colors">
                        <td className="py-3 pl-2 text-[#8A94A0]">{idx + 1}</td>
                        <td className="py-3">
                          <div className="font-semibold text-[#2C3E50]">{app.studentId?.name || "N/A"}</div>
                          <div className="text-xs text-[#8A94A0]">{app.studentId?.email || ""}</div>
                        </td>
                        <td className="py-3 font-mono text-[#8A94A0] text-xs">{app.enrollmentNo || "N/A"}</td>
                        <td className="py-3 text-[#8A94A0]">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <select
                            className="text-xs font-semibold rounded-lg px-2 py-1 border border-[#E4E2DC] bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5B8DB8]"
                            value={app.status || "applied"}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          >
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="selected">Selected</option>
                          </select>
                        </td>
                        <td className="py-3">
                          {app.resume ? (
                            app.resume.startsWith("http") ? (
                              <a href={app.resume} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#5B8DB8] hover:underline text-xs font-medium">
                                <Link2 className="w-3.5 h-3.5" /> View
                              </a>
                            ) : (
                              <a href={`/uploads/resumes/${app.resume}`} target="_blank" rel="noreferrer" className="text-[#5B8DB8] hover:underline text-xs font-medium">
                                View File
                              </a>
                            )
                          ) : <span className="text-[#D8D5CE]">—</span>}
                        </td>
                        <td className="py-3">
                          {app.answers?.length > 0 ? (
                            <details className="group">
                              <summary className="cursor-pointer text-xs text-[#5B8DB8] font-medium list-none hover:underline">View ({app.answers.length})</summary>
                              <div className="mt-2 text-xs space-y-1 bg-[#F7F6F2] p-2 rounded-lg border border-[#E4E2DC]">
                                {app.answers.map((a, i) => (
                                  <div key={i}><span className="font-semibold text-[#2C3E50]">{a.question}:</span> <span className="text-[#8A94A0]">{a.answer || "—"}</span></div>
                                ))}
                              </div>
                            </details>
                          ) : <span className="text-[#D8D5CE]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Student: Already Applied ─── */}
        {user?.role === "student" && hasApplied && myApplication && (
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2C3E50] text-lg">Your Application</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[myApplication.status || "applied"]?.cls}`}>
                {STATUS_CONFIG[myApplication.status || "applied"]?.label}
              </span>
            </div>

            <div className="bg-[#EDF7F2] border border-green-200 rounded-[8px] p-4 flex items-start gap-3 mb-5">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">Your application has been submitted and is under review.</p>
            </div>

            {myApplication.answers?.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="font-semibold text-sm text-[#2C3E50]">Your Responses</h3>
                {myApplication.answers.map((a, i) => (
                  <div key={i} className="bg-[#F7F6F2] p-4 rounded-[8px] border border-[#E4E2DC]">
                    <p className="text-xs font-semibold text-[#8A94A0] mb-1">{a.question}</p>
                    <p className="text-sm font-medium text-[#2C3E50]">{a.answer || "—"}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#E4E2DC] pt-4">
              <h3 className="font-semibold text-sm text-[#2C3E50] mb-2">Resume Submitted</h3>
              {myApplication.resume?.startsWith("http") ? (
                <a href={myApplication.resume} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#5B8DB8] hover:underline text-sm font-medium">
                  <Link2 className="w-4 h-4" /> View Resume
                </a>
              ) : (
                <a href={`/uploads/resumes/${myApplication.resume}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#5B8DB8] hover:underline">
                  View Uploaded File
                </a>
              )}
            </div>
          </div>
        )}

        {/* ─── Student: Apply Form ─── */}
        {user?.role === "student" && !isExpired && !hasApplied && (
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-8">
            <h2 className="font-semibold text-[#2C3E50] text-lg mb-6">Apply for this Role</h2>
            <form onSubmit={handleApply} className="space-y-6">
              {answers.map((a, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">{a.question}</label>
                  {a.question.toLowerCase().includes("cgpa") ? (
                    <input
                      type="number" step="0.01" min="0" max="10"
                      className="w-full border border-[#E4E2DC] rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DB8]/30 focus:border-[#5B8DB8] transition-colors"
                      placeholder="e.g. 8.5"
                      value={a.answer}
                      onChange={(e) => { const up = [...answers]; up[i].answer = e.target.value; setAnswers(up); }}
                      required
                    />
                  ) : (
                    <textarea
                      rows={3}
                      className="w-full border border-[#E4E2DC] rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DB8]/30 focus:border-[#5B8DB8] transition-colors resize-none"
                      value={a.answer}
                      onChange={(e) => { const up = [...answers]; up[i].answer = e.target.value; setAnswers(up); }}
                    />
                  )}
                </div>
              ))}

              {/* Resume Section */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Resume — {company.resumeType === "link" ? "Google Drive Link" : "Upload PDF/DOC"}
                </label>
                {company.resumeType === "link" ? (
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A0]" />
                    <input
                      type="url"
                      className="w-full pl-10 pr-4 border border-[#E4E2DC] rounded-[8px] py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DB8]/30 focus:border-[#5B8DB8] transition-colors"
                      placeholder="https://drive.google.com/..."
                      onChange={(e) => setResume(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E4E2DC] rounded-[8px] p-8 cursor-pointer hover:border-[#5B8DB8] hover:bg-[#F0F4F8]/30 transition-colors group">
                    <Upload className="w-8 h-8 text-[#8A94A0] group-hover:text-[#5B8DB8] mb-2 transition-colors" />
                    <span className="text-sm font-medium text-[#8A94A0]">{resume ? resume.name : "Click to upload resume"}</span>
                    <span className="text-xs text-[#8A94A0] mt-1">PDF, DOC, or DOCX</span>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} required />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full py-3 rounded-[8px] bg-[#5B8DB8] hover:bg-[#2B45D4] text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {applying ? <><span className="loading loading-spinner loading-xs"></span>Submitting...</> : "Submit Application"}
              </button>
            </form>
          </div>
        )}

        {/* Expired Notice */}
        {user?.role === "student" && isExpired && !hasApplied && (
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] p-6 text-center text-[#8A94A0]">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-[#D8D5CE]" />
            <p className="font-semibold text-[#2C3E50]">Applications Closed</p>
            <p className="text-sm mt-1">The application deadline for this role has passed.</p>
          </div>
        )}

      </div>
    </div>
  );
}
