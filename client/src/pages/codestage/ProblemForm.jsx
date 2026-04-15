import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ProblemForm() {
  const { id } = useParams(); // undefined = create mode, present = edit mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    title: "",
    difficulty: "easy",
    description: "",
    constraints: "",
    tags: "",
    sampleInput: "",
    sampleOutput: "",
    testCases: [{ input: "", output: "", isHidden: false }],
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/codestage/problems/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            title: p.title || "",
            difficulty: p.difficulty || "easy",
            description: p.description || "",
            constraints: p.constraints || "",
            tags: (p.tags || []).join(", "),
            sampleInput: p.sampleInput || "",
            sampleOutput: p.sampleOutput || "",
            testCases: p.testCases?.length > 0
              ? p.testCases.map((tc) => ({ input: tc.input, output: tc.output, isHidden: tc.isHidden || false }))
              : [{ input: "", output: "", isHidden: false }],
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const addTestCase = () => {
    setForm({ ...form, testCases: [...form.testCases, { input: "", output: "", isHidden: false }] });
  };

  const removeTestCase = (idx) => {
    if (form.testCases.length <= 1) return alert("At least one test case is required");
    setForm({ ...form, testCases: form.testCases.filter((_, i) => i !== idx) });
  };

  const updateTestCase = (idx, field, value) => {
    const updated = [...form.testCases];
    updated[idx][field] = value;
    setForm({ ...form, testCases: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        difficulty: form.difficulty,
        description: form.description,
        constraints: form.constraints,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sampleInput: form.sampleInput,
        sampleOutput: form.sampleOutput,
        testCases: form.testCases,
      };

      if (isEdit) {
        await api.put(`/codestage/problems/${id}`, payload);
        alert("Problem updated successfully!");
      } else {
        await api.post("/codestage/problems", payload);
        alert("Problem created successfully!");
      }
      navigate("/codestage");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save problem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "✏️ Edit Problem" : "➕ Add New Problem"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body space-y-4">
            <h2 className="card-title text-base">Problem Details</h2>

            <div>
              <label className="label"><span className="label-text font-medium">Title *</span></label>
              <input className="input input-bordered w-full" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text font-medium">Difficulty *</span></label>
                <select className="select select-bordered w-full" value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Tags (comma-separated)</span></label>
                <input className="input input-bordered w-full" placeholder="e.g. array, dp, greedy"
                  value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label"><span className="label-text font-medium">Description *</span></label>
              <textarea className="textarea textarea-bordered w-full h-32" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div>
              <label className="label"><span className="label-text font-medium">Constraints</span></label>
              <textarea className="textarea textarea-bordered w-full h-20" placeholder="e.g. 1 ≤ n ≤ 10^5"
                value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Sample I/O */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body space-y-4">
            <h2 className="card-title text-base">Sample Input / Output</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text font-medium">Sample Input</span></label>
                <textarea className="textarea textarea-bordered w-full font-mono text-sm h-24"
                  value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} />
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Sample Output</span></label>
                <textarea className="textarea textarea-bordered w-full font-mono text-sm h-24"
                  value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-base">Test Cases ({form.testCases.length})</h2>
              <button type="button" className="btn btn-sm btn-primary" onClick={addTestCase}>+ Add Test Case</button>
            </div>

            {form.testCases.map((tc, idx) => (
              <div key={idx} className="border border-base-300 rounded-lg p-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Test Case #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="label cursor-pointer gap-2">
                      <span className="label-text text-xs">Hidden</span>
                      <input type="checkbox" className="toggle toggle-sm toggle-warning"
                        checked={tc.isHidden} onChange={(e) => updateTestCase(idx, "isHidden", e.target.checked)} />
                    </label>
                    {form.testCases.length > 1 && (
                      <button type="button" className="btn btn-error btn-xs btn-ghost" onClick={() => removeTestCase(idx)}>✕</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label"><span className="label-text text-xs">Input</span></label>
                    <textarea className="textarea textarea-bordered w-full font-mono text-xs h-20"
                      value={tc.input} onChange={(e) => updateTestCase(idx, "input", e.target.value)} required />
                  </div>
                  <div>
                    <label className="label"><span className="label-text text-xs">Expected Output</span></label>
                    <textarea className="textarea textarea-bordered w-full font-mono text-xs h-20"
                      value={tc.output} onChange={(e) => updateTestCase(idx, "output", e.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/codestage")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Problem" : "Create Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}
