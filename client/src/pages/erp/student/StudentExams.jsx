import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function StudentExams() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/courses/exams/results/me")
      .then((res) => setResults(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  const typeColor = { midterm: "badge-info", endterm: "badge-warning", quiz: "badge-success", assignment: "badge-ghost" };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📝 My Exam Results
      </h1>

      {results.length === 0 ? (
        <div className="alert alert-info"><span>No exam results available yet.</span></div>
      ) : (
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={r._id}>
                      <td>{idx + 1}</td>
                      <td className="font-medium">
                        {r.examId?.courseId?.name || "—"}
                        <div className="text-xs text-base-content/50">{r.examId?.courseId?.courseCode}</div>
                      </td>
                      <td>{r.examId?.name || "—"}</td>
                      <td><span className={`badge badge-xs ${typeColor[r.examId?.type] || "badge-ghost"}`}>{r.examId?.type}</span></td>
                      <td className="text-sm">{r.examId?.date ? new Date(r.examId.date).toLocaleDateString() : "—"}</td>
                      <td className="font-semibold">{r.marksObtained} / {r.examId?.totalMarks}</td>
                      <td><span className="badge badge-sm badge-primary">{r.grade || "—"}</span></td>
                      <td className="text-sm text-base-content/60">{r.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
