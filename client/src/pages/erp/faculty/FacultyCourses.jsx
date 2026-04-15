import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/faculty/me/courses").then((res) => setCourses(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📖 My Courses</h1>
      {courses.length === 0 ? (
        <div className="alert alert-info"><span>No courses assigned yet.</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c, i) => (
            <div key={i} className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base">{c.courseId?.courseCode} — {c.courseId?.name}</h2>
                <p className="text-sm text-base-content/60">Credits: {c.courseId?.credits}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
