import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const AVAILABLE_BRANCHES = [
  { label: "Computer Science (CS/CSE)", values: ["Computer Science", "CS", "CSE"] },
  { label: "Information Technology (IT)", values: ["Information Technology", "IT", "ICT", "MSc IT"] },
  { label: "Electronics & Communication (ECE)", values: ["Electronics", "Communication", "ECE"] },
  { label: "Electrical Engineering (EE)", values: ["Electrical", "EE"] },
  { label: "Mechanical Engineering (ME)", values: ["Mechanical", "ME"] },
  { label: "Civil Engineering (CE)", values: ["Civil", "CE"] },
];

export default function CreateCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", role: "", description: "", lastDate: "", formQuestions: ["What is your CGPA?"], resumeType: "link", minCGPA: "", eligibleBranches: [] });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        formQuestions: form.formQuestions.filter(Boolean),
        minCGPA: form.minCGPA ? Number(form.minCGPA) : 0,
        eligibleBranches: form.eligibleBranches,
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
          <div className="border-y border-base-200 py-4 space-y-4">
            <p className="text-sm font-medium text-base-content/80">Eligibility Criteria (optional)</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1 md:max-w-xs">
                <label className="label"><span className="label-text font-semibold text-[#2C3E50]">Minimum CGPA (0–10)</span></label>
                <input type="number" className="input input-bordered w-full" placeholder="e.g. 7.0" min="0" max="10" step="0.1" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} />
              </div>
              <div className="form-control flex-1">
                <label className="label"><span className="label-text font-semibold text-[#2C3E50]">Eligible Branches</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-[#E4E2DC] rounded-[8px] p-4 bg-[#F7F6F2]">
                  {AVAILABLE_BRANCHES.map((b) => (
                    <label key={b.label} className="flex items-center gap-2 cursor-pointer hover:bg-[#F0F4F8]/50 p-1.5 rounded-[6px] transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={b.values.every(val => form.eligibleBranches.includes(val))}
                        onChange={(e) => {
                          let updated = [...form.eligibleBranches];
                          if (e.target.checked) {
                            b.values.forEach(val => {
                              if (!updated.includes(val)) updated.push(val);
                            });
                          } else {
                            updated = updated.filter(val => !b.values.includes(val));
                          }
                          setForm({ ...form, eligibleBranches: updated });
                        }}
                      />
                      <span className="text-sm text-[#2C3E50]">{b.label}</span>
                    </label>
                  ))}
                </div>
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
