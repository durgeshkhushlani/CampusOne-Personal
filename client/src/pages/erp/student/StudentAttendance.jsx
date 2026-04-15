import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/students/me/attendance")
      .then((res) => setAttendance(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Attendance</h1>
      {attendance.length === 0 ? (
        <div className="alert alert-info"><span>No attendance records found.</span></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Course</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Absent</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={i}>
                  <td>{a.course?.courseCode} — {a.course?.name}</td>
                  <td>{a.totalClasses}</td>
                  <td>{a.attended}</td>
                  <td>{a.absent}</td>
                  <td>
                    <span className={`font-bold ${a.belowMinimum ? "text-error" : "text-success"}`}>
                      {a.percentage}%
                    </span>
                  </td>
                  <td>
                    {a.belowMinimum ? (
                      <span className="badge badge-error badge-sm">Low</span>
                    ) : (
                      <span className="badge badge-success badge-sm">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
