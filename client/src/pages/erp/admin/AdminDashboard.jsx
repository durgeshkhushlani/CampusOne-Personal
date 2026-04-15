import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    api.get("/erp/admin/stats").then((res) => setStats(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const loadTab = async (tab) => {
    if (activeTab === tab) { setActiveTab(null); return; }
    setActiveTab(tab);
    setTabLoading(true);
    try {
      const endpoints = {
        students: "/erp/students",
        faculty: "/erp/faculty",
        courses: "/erp/courses",
        announcements: "/erp/admin/announcements",
      };
      const res = await api.get(endpoints[tab]);
      setTabData(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 ERP Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 shadow rounded-xl border border-base-300">
            <div className="stat-title">Students</div>
            <div className="stat-value text-primary">{stats.totalStudents}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl border border-base-300">
            <div className="stat-title">Faculty</div>
            <div className="stat-value text-secondary">{stats.totalFaculty}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl border border-base-300">
            <div className="stat-title">Courses</div>
            <div className="stat-value text-accent">{stats.totalCourses}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl border border-base-300">
            <div className="stat-title">Fee Defaulters</div>
            <div className="stat-value text-error">{stats.feeDefaulters}</div>
          </div>
        </div>
      )}

      {/* Manage Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Manage</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={() => loadTab("students")} className={`btn btn-sm ${activeTab === "students" ? "btn-primary" : "btn-outline"}`}>👨‍🎓 Students</button>
            <button onClick={() => loadTab("faculty")} className={`btn btn-sm ${activeTab === "faculty" ? "btn-primary" : "btn-outline"}`}>👨‍🏫 Faculty</button>
            <button onClick={() => loadTab("courses")} className={`btn btn-sm ${activeTab === "courses" ? "btn-primary" : "btn-outline"}`}>📖 Courses</button>
            <button onClick={() => loadTab("announcements")} className={`btn btn-sm ${activeTab === "announcements" ? "btn-primary" : "btn-outline"}`}>📢 Announcements</button>
          </div>
        </div>
      </div>

      {/* Inline Data Table */}
      {activeTab && (
        <div className="card bg-base-100 shadow border border-base-300 mt-4">
          <div className="card-body">
            <h3 className="card-title text-base capitalize">{activeTab} ({tabData.length})</h3>
            {tabLoading ? (
              <div className="flex justify-center p-4"><span className="loading loading-spinner"></span></div>
            ) : tabData.length === 0 ? (
              <p className="text-base-content/50 text-sm">No data found.</p>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      {activeTab === "students" && <><th>#</th><th>Name</th><th>Enrollment</th><th>Department</th><th>Semester</th><th>Batch</th></>}
                      {activeTab === "faculty" && <><th>#</th><th>Name</th><th>Employee ID</th><th>Department</th><th>Designation</th></>}
                      {activeTab === "courses" && <><th>#</th><th>Code</th><th>Name</th><th>Department</th><th>Credits</th><th>Semester</th></>}
                      {activeTab === "announcements" && <><th>#</th><th>Title</th><th>Priority</th><th>Audience</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {tabData.map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td>{idx + 1}</td>
                        {activeTab === "students" && <><td>{item.firstName} {item.lastName}</td><td>{item.enrollmentNo}</td><td>{item.department}</td><td>{item.semester}</td><td>{item.batch}</td></>}
                        {activeTab === "faculty" && <><td>{item.firstName} {item.lastName}</td><td>{item.employeeId}</td><td>{item.department}</td><td>{item.designation}</td></>}
                        {activeTab === "courses" && <><td>{item.courseCode}</td><td>{item.name}</td><td>{item.department}</td><td>{item.credits}</td><td>{item.semester}</td></>}
                        {activeTab === "announcements" && <><td>{item.title}</td><td><span className={`badge badge-sm ${item.priority === "high" ? "badge-error" : item.priority === "medium" ? "badge-warning" : "badge-info"}`}>{item.priority}</span></td><td>{item.targetAudience}</td></>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

