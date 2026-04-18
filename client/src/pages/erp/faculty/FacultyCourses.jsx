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
    <div className="p-6 max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        My Assigned Courses
      </h1>
      {courses.length === 0 ? (
        <div className="alert alert-info"><span>No courses assigned yet.</span></div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((c, i) => {
            const course = c.courseId;
            if (!course) return null;
            return (
              <div key={i} className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                  <div className="flex justify-between items-start border-b pb-3 mb-2">
                    <div>
                      <h2 className="card-title text-xl text-primary">{course.courseCode} — {course.name}</h2>
                      <p className="text-sm text-base-content/60 font-medium">Department: {course.department} | Credits: {course.credits}</p>
                    </div>
                    <div className="text-right">
                       <span className="badge badge-info badge-sm">Active</span>
                       <p className="text-xs text-base-content/50 mt-1">~60 Enrolled</p> {/* Mock enrolled count as requested */}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <h3 className="text-sm font-semibold text-base-content/80 mb-1">Program Objective</h3>
                      <p className="text-sm text-base-content/70 italic bg-base-200/50 p-3 rounded">{course.programObjective || "To provide foundational knowledge and analytical skills in this domain."}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-base-content/80 mb-1">Syllabus Highlights</h3>
                      <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1 bg-base-200/50 p-3 rounded">
                        {course.syllabus ? course.syllabus.map((syl, idx) => (
                           <li key={idx}>{syl}</li>
                        )) : (
                           <>
                             <li>Unit 1: Introduction to Concepts</li>
                             <li>Unit 2: Theoretical Foundations</li>
                             <li>Unit 3: Applied Methodologies</li>
                             <li>Unit 4: Advanced Case Studies</li>
                           </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
