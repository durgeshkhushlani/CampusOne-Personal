import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: "", address: "", bloodGroup: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/erp/students/me")
      .then((res) => {
        setProfile(res.data.data);
        setForm({
          phone: res.data.data.phone || "",
          address: res.data.data.address || "",
          bloodGroup: res.data.data.bloodGroup || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/erp/students/me/profile", form);
      setProfile(res.data.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (!profile)
    return (
      <div className="p-6">
        <div className="alert alert-info"><span>No ERP profile found. Contact admin.</span></div>
      </div>
    );

  const readOnlyFields = [
    { label: "Name", value: `${profile.firstName} ${profile.lastName}` },
    { label: "Enrollment No", value: profile.enrollmentNo },
    { label: "Department", value: profile.department },
    { label: "Program", value: profile.program },
    { label: "Semester", value: profile.semester },
    { label: "Batch", value: profile.batch || "—" },
    { label: "Gender", value: profile.gender || "—" },
    { label: "Date of Birth", value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—" },
    { label: "Guardian", value: profile.guardianName || "—" },
    { label: "Guardian Phone", value: profile.guardianPhone || "—" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          👤 My Profile
        </h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">✏️ Edit Profile</button>
        )}
      </div>

      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          {/* Read-only fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readOnlyFields.map((f) => (
              <div key={f.label}>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-medium">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="divider text-xs text-base-content/40">Editable Fields</div>

          {editing ? (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Phone</span></label>
                <input
                  type="tel"
                  className="input input-bordered w-full"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Address</span></label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 123 Main Street, City"
                  rows="2"
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Blood Group</span></label>
                <select
                  className="select select-bordered w-full"
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button onClick={() => { setEditing(false); setForm({ phone: profile.phone || "", address: profile.address || "", bloodGroup: profile.bloodGroup || "" }); }} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium">{profile.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Blood Group</p>
                <p className="text-sm font-medium">{profile.bloodGroup || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Address</p>
                <p className="text-sm font-medium">{profile.address || "—"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
