import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/erp/students/me/fees")
      .then((res) => setFees(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💰 Fee Details</h1>
      {fees.length === 0 ? (
        <div className="alert alert-info"><span>No fee records found.</span></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead><tr><th>Semester</th><th>Description</th><th>Total</th><th>Paid</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {fees.map((f, i) => (
                <tr key={i}>
                  <td>{f.semester}</td>
                  <td>{f.description}</td>
                  <td>₹{f.totalAmount?.toLocaleString()}</td>
                  <td>₹{f.paidAmount?.toLocaleString()}</td>
                  <td>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <span className={`badge badge-sm ${
                      f.status === "paid" ? "badge-success" : f.status === "partial" ? "badge-warning" : "badge-error"
                    }`}>{f.status}</span>
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
