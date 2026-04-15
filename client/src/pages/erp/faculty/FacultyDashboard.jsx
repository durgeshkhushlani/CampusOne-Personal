import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function FacultyDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/faculty/me")
      .then((res) => setProfile(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 ERP Faculty Dashboard</h1>
      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Profile</h2>
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Employee ID:</strong> {profile.employeeId}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              <p><strong>Designation:</strong> {profile.designation}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Quick Links</h2>
              <div className="flex flex-col gap-2 mt-2">
                <a href="/erp/faculty/courses" className="btn btn-sm btn-outline">📖 My Courses</a>
                <a href="/erp/faculty/attendance" className="btn btn-sm btn-outline">✅ Mark Attendance</a>
                <a href="/erp/faculty/timetable" className="btn btn-sm btn-outline">🗓️ Timetable</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info"><span>No faculty profile found. Contact admin.</span></div>
      )}
    </div>
  );
}
