import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function CreateCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", role: "", description: "", lastDate: "", formQuestions: [""] });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/hiresphere/companies", { ...form, formQuestions: form.formQuestions.filter(Boolean) });
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
      <h1 className="text-2xl font-bold mb-6">➕ Add Company</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body space-y-4">
          <input className="input input-bordered w-full" placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" placeholder="Role (e.g. SDE Intern)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="date" className="input input-bordered w-full" value={form.lastDate} onChange={(e) => setForm({ ...form, lastDate: e.target.value })} required />

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
