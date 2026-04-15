import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function MarkAttendance() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">✅ Mark Attendance</h1>
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <p className="text-base-content/60">Select a course and date to mark attendance for enrolled students.</p>
          <div className="alert alert-info mt-4"><span>Coming soon — attendance marking interface will be implemented here.</span></div>
        </div>
      </div>
    </div>
  );
}
