import React, { useState, useEffect } from "react";
import { User, UserRole, Complaint } from "../types";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
} from "lucide-react";

interface ComplaintSystemProps {
  user: User;
}

const ComplaintSystem: React.FC<ComplaintSystemProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ category: 'Maintenance', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user.role === UserRole.CHAIRMAN_SECRETARY || user.role === UserRole.WARDEN_MATREN || user.role === UserRole.STAFF;

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    fetch("/api/complaints")
      .then((res) => res.json())
      .then(setComplaints)
      .catch((err) => console.error("Failed to fetch complaints", err));
  };

  const handleSubmit = async () => {
    if (!newComplaint.description) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          category: newComplaint.category,
          description: newComplaint.description,
          status: "Pending",
          createdAt: new Date().toISOString().split('T')[0]
        }),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewComplaint({ category: 'Maintenance', description: '' });
        fetchComplaints();
      }
    } catch (err) {
      console.error("Failed to submit complaint", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const filteredComplaints = isAdmin
    ? complaints
    : complaints.filter((c) => c.studentId === user.id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Complaints & Requests
          </h2>
          <p className="text-gray-500">
            Report issues and track their resolution status.
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Plus size={18} />
            <span className="font-semibold text-sm">New Complaint</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters and Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Filter size={16} className="mr-2 text-blue-600" />
              Categories
            </h3>
            <div className="space-y-1">
              {["All Complaints", "Maintenance", "Food", "Room", "Other"].map(
                (cat) => (
                  <button
                    key={cat}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${cat === "All Complaints"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Resolved
              </span>
              <span className="text-sm font-bold text-emerald-600">84%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: "84%" }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Great job! Most issues are resolved within 24 hours.
            </p>
          </div>
        </div>

        {/* Complaint List */}
        <div className="lg:col-span-9">
          <div className="space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id || complaint._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group cursor-pointer overflow-hidden"
                >
                  <div className="flex">
                    <div
                      className={`w-1.5 ${complaint.status === "Resolved"
                          ? "bg-emerald-500"
                          : complaint.status === "In Progress"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                    ></div>
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {complaint.category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {complaint.createdAt}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {complaint.description}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Filed by{" "}
                            <span className="font-semibold text-gray-700">
                              {complaint.studentName}
                            </span>{" "}
                            • ID: #{complaint.studentId?.substring(0, 6)}
                          </p>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                        />
                      </div>

                      {complaint.status === "In Progress" && (
                        <div className="mt-6 flex items-center space-x-2 text-blue-600">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                          <p className="text-[11px] font-bold uppercase tracking-wider">
                            Assigned to Maintenance Staff
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-gray-300" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  No Complaints Found
                </h3>
                <p className="text-sm text-gray-500">
                  Everything seems to be running smoothly!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for adding complaint */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  File a Complaint
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  >
                    <option>Maintenance</option>
                    <option>Food</option>
                    <option>Room</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  ></textarea>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintSystem;
