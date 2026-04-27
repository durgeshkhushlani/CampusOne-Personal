import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function FacultyExams() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Create exam form
  const [examForm, setExamForm] = useState({ courseId: "", name: "", type: "midterm", date: "", totalMarks: 100 });

  // Result entry
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [existingResults, setExistingResults] = useState([]);
  const [resultForm, setResultForm] = useState({});
  const [savingResults, setSavingResults] = useState(false);

  const fetchData = async () => {
    try {
      const coursesRes = await api.get("/erp/faculty/me/courses");
      setCourses(coursesRes.data.data || []);

      const examsRes = await api.get("/erp/courses/exams/by-faculty");
      setExams(examsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/erp/courses/exams", examForm);
      setExamForm({ courseId: "", name: "", type: "midterm", date: "", totalMarks: 100 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectExam = async (exam) => {
    if (selectedExam?._id === exam._id) {
      setSelectedExam(null);
      return;
    }
    setSelectedExam(exam);
    try {
      // Fetch enrolled students for this course
      const stuRes = await api.get(`/erp/faculty/course/${exam.courseId._id}/students`);
      const enrolled = stuRes.data.data || [];
      setStudents(enrolled);

      // Fetch existing results for this exam
      const resRes = await api.get(`/erp/courses/exams/${exam._id}/results`);
      const results = resRes.data.data || [];
      setExistingResults(results);

      // Pre-fill result form
      const formObj = {};
      enrolled.forEach((e) => {
        const sid = e.studentId?._id || e.studentId;
        const existing = results.find((r) => (r.studentId?._id || r.studentId) === sid);
        formObj[sid] = {
          marksObtained: existing?.marksObtained ?? "",
          grade: existing?.grade ?? "",
          remarks: existing?.remarks ?? "",
        };
      });
      setResultForm(formObj);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveResults = async () => {
    setSavingResults(true);
    try {
      const promises = Object.entries(resultForm)
        .filter(([, val]) => val.marksObtained !== "")
        .map(([studentId, val]) =>
          api.post("/erp/courses/exams/results", {
            examId: selectedExam._id,
            studentId,
            marksObtained: Number(val.marksObtained),
            grade: val.grade || "",
            remarks: val.remarks || "",
          })
        );
      await Promise.all(promises);
      alert("Results saved successfully!");
      // Refresh existing results
      const resRes = await api.get(`/erp/courses/exams/${selectedExam._id}/results`);
      setExistingResults(resRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save results");
    } finally {
      setSavingResults(false);
    }
  };

  const typeColor = { midterm: "badge-info", endterm: "badge-warning", quiz: "badge-success", assignment: "badge-ghost" };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">📝 Exams & Results</h1>

      {/* Create Exam Form */}
      <div className="card bg-base-100 shadow border border-base-300 mb-6">
        <div className="card-body">
          <h2 className="card-title text-base border-b pb-2">Create New Exam</h2>
          <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Course</span></label>
              <select
                className="select select-bordered w-full"
                value={examForm.courseId}
                onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.courseId?._id || c._id} value={c.courseId?._id || c._id}>
                    {c.courseId?.courseCode || c.courseCode} — {c.courseId?.name || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Exam Name</span></label>
              <input
                className="input input-bordered w-full"
                value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                placeholder="e.g. Midterm Exam"
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Type</span></label>
              <select className="select select-bordered w-full" value={examForm.type} onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}>
                <option value="midterm">Midterm</option>
                <option value="endterm">Endterm</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Date</span></label>
              <input type="date" className="input input-bordered w-full" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Total Marks</span></label>
              <input type="number" className="input input-bordered w-full" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })} required min="1" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                {creating ? "Creating..." : "➕ Create Exam"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Exam List */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-base border-b pb-2">My Exams ({exams.length})</h2>

          {exams.length === 0 ? (
            <p className="text-base-content/50 text-sm mt-2">No exams created yet.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {exams.map((exam) => (
                <div key={exam._id}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedExam?._id === exam._id ? "bg-primary/10 border border-primary/30" : "bg-base-200 hover:bg-base-300"
                    }`}
                    onClick={() => handleSelectExam(exam)}
                  >
                    <div>
                      <span className="font-medium text-sm">{exam.name}</span>
                      <span className="text-xs text-base-content/50 ml-2">{exam.courseId?.courseCode} — {exam.courseId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge badge-xs ${typeColor[exam.type]}`}>{exam.type}</span>
                      <span className="text-xs text-base-content/50">{new Date(exam.date).toLocaleDateString()}</span>
                      <span className="text-xs font-mono">{exam.totalMarks} marks</span>
                      <svg className={`w-4 h-4 transition-transform ${selectedExam?._id === exam._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Result Entry Sub-section */}
                  {selectedExam?._id === exam._id && (
                    <div className="mt-2 p-4 border border-base-300 rounded-lg bg-base-100">
                      <h3 className="text-sm font-bold mb-3">Enter Results for {exam.name}</h3>
                      {students.length === 0 ? (
                        <p className="text-sm text-base-content/50">No students enrolled in this course.</p>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Student</th>
                                  <th>Enrollment</th>
                                  <th>Marks (/{exam.totalMarks})</th>
                                  <th>Grade</th>
                                  <th>Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {students.map((e) => {
                                  const s = e.studentId || e;
                                  const sid = s._id;
                                  const rf = resultForm[sid] || {};
                                  return (
                                    <tr key={sid}>
                                      <td className="font-medium text-sm">{s.firstName} {s.lastName}</td>
                                      <td className="text-xs font-mono">{s.enrollmentNo}</td>
                                      <td>
                                        <input
                                          type="number"
                                          className="input input-bordered input-xs w-20"
                                          min="0"
                                          max={exam.totalMarks}
                                          value={rf.marksObtained ?? ""}
                                          onChange={(ev) =>
                                            setResultForm({
                                              ...resultForm,
                                              [sid]: { ...rf, marksObtained: ev.target.value },
                                            })
                                          }
                                        />
                                      </td>
                                      <td>
                                        <select
                                          className="select select-bordered select-xs"
                                          value={rf.grade ?? ""}
                                          onChange={(ev) =>
                                            setResultForm({
                                              ...resultForm,
                                              [sid]: { ...rf, grade: ev.target.value },
                                            })
                                          }
                                        >
                                          <option value="">—</option>
                                          {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((g) => (
                                            <option key={g} value={g}>{g}</option>
                                          ))}
                                        </select>
                                      </td>
                                      <td>
                                        <input
                                          className="input input-bordered input-xs w-28"
                                          placeholder="optional"
                                          value={rf.remarks ?? ""}
                                          onChange={(ev) =>
                                            setResultForm({
                                              ...resultForm,
                                              [sid]: { ...rf, remarks: ev.target.value },
                                            })
                                          }
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <button
                            onClick={handleSaveResults}
                            className="btn btn-primary btn-sm mt-3"
                            disabled={savingResults}
                          >
                            {savingResults ? "Saving..." : "💾 Save All Results"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
