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
    <div className="p-6 max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        ERP Faculty Dashboard
      </h1>
      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base border-b pb-2">Profile</h2>
                <div className="mt-2 text-sm space-y-2">
                  <p><span className="font-semibold text-base-content/70">Name:</span> {profile.firstName} {profile.lastName}</p>
                  <p><span className="font-semibold text-base-content/70">Employee ID:</span> {profile.employeeId}</p>
                  <p><span className="font-semibold text-base-content/70">Department:</span> {profile.department}</p>
                  <p><span className="font-semibold text-base-content/70">Designation:</span> {profile.designation}</p>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base border-b pb-2">Quick Links</h2>
                <div className="flex flex-col gap-2 mt-2">
                  <a href="/erp/faculty/courses" className="btn btn-sm btn-outline justify-start">My Courses</a>
                  <a href="/erp/faculty/attendance" className="btn btn-sm btn-outline justify-start">Mark Student Attendance</a>
                  <a href="/erp/faculty/timetable" className="btn btn-sm btn-outline justify-start">Timetable</a>
                  <a href="/erp/faculty/exams" className="btn btn-sm btn-outline justify-start">📝 Exams & Results</a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base border-b pb-2">My Campus Attendance (April)</h2>
                <div className="overflow-x-auto mt-2">
                  <table className="table table-zebra w-full text-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Apr 01, 2026</td>
                        <td>Wednesday</td>
                        <td>08:45 AM</td>
                        <td>05:10 PM</td>
                        <td><span className="badge badge-success badge-xs">Present</span></td>
                      </tr>
                      <tr>
                        <td>Apr 02, 2026</td>
                        <td>Thursday</td>
                        <td>08:50 AM</td>
                        <td>05:05 PM</td>
                        <td><span className="badge badge-success badge-xs">Present</span></td>
                      </tr>
                      <tr>
                        <td>Apr 03, 2026</td>
                        <td>Friday</td>
                        <td>--:--</td>
                        <td>--:--</td>
                        <td><span className="badge badge-error badge-xs">Leave</span></td>
                      </tr>
                      <tr>
                        <td>Apr 06, 2026</td>
                        <td>Monday</td>
                        <td>08:40 AM</td>
                        <td>06:00 PM</td>
                        <td><span className="badge badge-success badge-xs">Present</span></td>
                      </tr>
                      <tr>
                        <td>Apr 07, 2026</td>
                        <td>Tuesday</td>
                        <td>08:55 AM</td>
                        <td>05:30 PM</td>
                        <td><span className="badge badge-success badge-xs">Present</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info shadow-sm bg-base-100"><span>No faculty profile found. Contact admin.</span></div>
      )}
    </div>
  );
}
