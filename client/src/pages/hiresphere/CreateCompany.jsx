import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function CreateCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", role: "", description: "", lastDate: "", formQuestions: ["What is your CGPA?"], resumeType: "link", minCGPA: "", eligibleBranches: "" });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        formQuestions: form.formQuestions.filter(Boolean),
        minCGPA: form.minCGPA ? Number(form.minCGPA) : 0,
        eligibleBranches: form.eligibleBranches ? form.eligibleBranches.split(",").map(b => b.trim()).filter(Boolean) : [],
      };
      await api.post("/hiresphere/companies", payload);
      navigate("/hiresphere");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create company");
    } finally {
      setCreating(false);
    }
  };

  const addQuestion = () => setForm({ ...form, formQuestions: [...form.formQuestions, ""] });
  const updateQuestion = (i, val) => {
    const up = [...form.formQuestions];
    up[i] = val;
    setForm({ ...form, formQuestions: up });
  };
  const removeQuestion = (i) => setForm({ ...form, formQuestions: form.formQuestions.filter((_, idx) => idx !== i) });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Company
      </h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body space-y-4">
          <input className="input input-bordered w-full" placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" placeholder="Role (e.g. SDE Intern)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="date" className="input input-bordered w-full" value={form.lastDate} onChange={(e) => setForm({ ...form, lastDate: e.target.value })} required />

          <div className="form-control py-2 border-y border-base-200">
            <label className="label cursor-pointer justify-start gap-6">
              <span className="label-text font-medium text-base-content/80">Resume Submission Format:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="resumeType" className="radio radio-primary radio-sm" value="file" checked={form.resumeType === "file"} onChange={(e) => setForm({ ...form, resumeType: e.target.value })} />
                <span className="label-text">File Upload (PDF/DOC)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="resumeType" className="radio radio-primary radio-sm" value="link" checked={form.resumeType === "link"} onChange={(e) => setForm({ ...form, resumeType: e.target.value })} />
                <span className="label-text">Google Drive Link</span>
              </label>
            </label>
          </div>

          {/* Eligibility Criteria */}
          <div className="border-y border-base-200 py-4 space-y-3">
            <p className="text-sm font-medium text-base-content/80">Eligibility Criteria (optional)</p>
            <div className="flex gap-4">
              <div className="form-control flex-1">
                <label className="label"><span className="label-text">Minimum CGPA (0–10)</span></label>
                <input type="number" className="input input-bordered w-full" placeholder="e.g. 7.0" min="0" max="10" step="0.1" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} />
              </div>
              <div className="form-control flex-1">
                <label className="label"><span className="label-text">Eligible Branches (comma-separated)</span></label>
                <input className="input input-bordered w-full" placeholder="e.g. CSE, IT, ECE" value={form.eligibleBranches} onChange={(e) => setForm({ ...form, eligibleBranches: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text font-medium">Custom Questions (optional)</span></label>
            {form.formQuestions.map((q, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input input-bordered flex-1" placeholder={`Question ${i + 1}`} value={q} onChange={(e) => updateQuestion(i, e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => removeQuestion(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addQuestion}>+ Add Question</button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? "Creating..." : "Create Company"}</button>
        </div>
      </form>
    </div>
  );
}
