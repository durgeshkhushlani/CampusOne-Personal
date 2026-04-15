import { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/erp/students/me");
        setProfile(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 ERP Student Dashboard</h1>

      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Profile</h2>
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Enrollment:</strong> {profile.enrollmentNo}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              <p><strong>Program:</strong> {profile.program}</p>
              <p><strong>Semester:</strong> {profile.semester}</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Quick Links</h2>
              <div className="flex flex-col gap-2 mt-2">
                <a href="/erp/student/courses" className="btn btn-sm btn-outline">📖 My Courses</a>
                <a href="/erp/student/attendance" className="btn btn-sm btn-outline">📊 Attendance</a>
                <a href="/erp/student/timetable" className="btn btn-sm btn-outline">🗓️ Timetable</a>
                <a href="/erp/student/fees" className="btn btn-sm btn-outline">💰 Fees</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <span>No ERP profile found. Contact admin to set up your profile.</span>
        </div>
      )}
    </div>
  );
}
