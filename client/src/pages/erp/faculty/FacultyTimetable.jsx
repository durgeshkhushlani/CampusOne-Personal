import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function FacultyTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/faculty/me/timetable")
      .then((res) => setTimetable(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const grouped = days.reduce((acc, day) => {
    acc[day] = timetable.filter((t) => t.day === day);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Faculty Timetable
      </h1>
      {timetable.length === 0 ? (
        <div className="alert alert-info"><span>No classes scheduled.</span></div>
      ) : (
        <div className="space-y-4">
          {days.map((day) =>
            grouped[day].length > 0 ? (
              <div key={day} className="card bg-base-100 shadow border border-base-300">
                <div className="card-body p-4">
                  <h2 className="font-bold text-lg">{day}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {grouped[day].map((slot, i) => (
                      <div key={i} className="bg-base-200 rounded-lg p-3">
                        <p className="font-semibold text-sm">{slot.courseId?.courseCode} — {slot.courseId?.name}</p>
                        <p className="text-xs text-base-content/60">{slot.startTime} - {slot.endTime} | Room: {slot.room || "TBA"}</p>
                        {/* We don't need to show faculty's own name, maybe just a reminder */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
