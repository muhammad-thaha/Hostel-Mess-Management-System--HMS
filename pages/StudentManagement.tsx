import React, { useState, useEffect } from "react";
import { User, UserRole } from "../types";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  CreditCard,
  UserCheck,
  Filter,
  Trash2,
  X,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";

const StudentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollData, setEnrollData] = useState<Partial<User>>({
    role: UserRole.STUDENT,
  });
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  const roles = [
    { label: "All", value: "ALL" },
    { label: "Chairman/Secretary", value: UserRole.CHAIRMAN_SECRETARY },
    { label: "Warden/Matren", value: UserRole.WARDEN_MATREN },
    { label: "Staff", value: UserRole.STAFF },
    { label: "Student", value: UserRole.STUDENT },
  ];

  const filteredMembers = members.filter((s) => {
    const matchesRole = roleFilter === "ALL" ? true : s.role === roleFilter;
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.messCardId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  /* View Logs Modal Logic */
  const [selectedUserLogs, setSelectedUserLogs] = useState<any[] | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleViewLogs = async (userId: string) => {
    setLoadingLogs(true);
    setShowLogsModal(true);
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      // Filter logs for this user (client-side filtering for now as API returns all)
      const userLogs = data.filter((log: any) => (log.studentId === userId) || (log.studentId && log.studentId._id === userId));
      setSelectedUserLogs(userLogs);
    } catch (err) {
      console.error(err);
      setSelectedUserLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... Header ... */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Mess Members Directory
          </h2>
          <p className="text-gray-500 text-sm">
            Review student mess status and manage cards.
          </p>
        </div>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100"
          onClick={() => {
            setShowEnroll(true);
            setEnrollData({ role: UserRole.STUDENT });
            setEnrollError(null);
          }}
        >
          <UserPlus size={18} />
          <span className="font-semibold text-sm">Enroll New Member</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, reg number, mess card..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex space-x-2">
            {roles.map((role) => (
              <button
                key={role.value}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${roleFilter === role.value
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => setRoleFilter(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member._id || member.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {member.role === UserRole.STUDENT &&
                        `${member.registerNumber} • ${member.year} Year`}
                      {member.role === UserRole.STAFF && "Staff"}
                      {member.role === UserRole.WARDEN_MATREN &&
                        (member.position || "Warden/Matren")}
                      {member.role === UserRole.CHAIRMAN_SECRETARY &&
                        (member.position || "Chairman/Secretary")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg border border-red-100"
                    title="Delete Member"
                    onClick={async () => {
                      if (window.confirm(`Delete ${member.name}?`)) {
                        await fetch(`/api/users/${member._id || member.id}`, {
                          method: "DELETE",
                        });
                        setMembers((prev) =>
                          prev.filter(
                            (m) => (m._id || m.id) !== (member._id || member.id)
                          )
                        );
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Card Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Mess Card
                  </p>
                  <div className="flex items-center text-xs font-bold text-slate-800">
                    <CreditCard size={12} className="mr-1.5 text-blue-500" />
                    {member.messCardId || "-"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Mess Status
                  </p>
                  <div className="flex items-center text-xs font-bold text-emerald-600">
                    <UserCheck size={12} className="mr-1.5" />
                    {member.messStatus || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-3">
                      Dept:
                    </span>
                    <span className="font-medium text-gray-700">
                      {member.department}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {member.role === UserRole.STUDENT
                  ? "Enrollment: June 2024"
                  : member.role}
              </span>
              <button
                onClick={() => handleViewLogs(member._id || member.id || "")}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                View Logs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
            <button
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700"
              onClick={() => setShowEnroll(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-black mb-4">
              Enroll New Member
            </h2>
            {enrollError && (
              <div className="text-red-600 font-bold mb-2">
                {enrollError}
              </div>
            )}
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setEnrollLoading(true);
                setEnrollError(null);
                try {
                  const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(enrollData),
                  });
                  if (!res.ok)
                    throw new Error("Failed to enroll member");
                  setShowEnroll(false);
                  setEnrollData({ role: UserRole.STUDENT });
                  // Refresh members
                  fetch("/api/users")
                    .then((res) => res.json())
                    .then((data) => setMembers(data));
                } catch (err: any) {
                  setEnrollError(
                    err.message || "Error enrolling member"
                  );
                } finally {
                  setEnrollLoading(false);
                }
              }}
            >
              <div>
                <CustomDropdown
                  label="Role"
                  required
                  value={enrollData.role as string}
                  onChange={(val) =>
                    setEnrollData((d) => ({
                      ...d,
                      role: val as UserRole,
                    }))
                  }
                  options={[
                    { value: UserRole.CHAIRMAN_SECRETARY, label: "Chairman/Secretary" },
                    { value: UserRole.WARDEN_MATREN, label: "Warden/Matron" },
                    { value: UserRole.STAFF, label: "Staff" },
                    { value: UserRole.STUDENT, label: "Student" },
                  ]}
                  placeholder="Select Role"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Name</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                  value={enrollData.name || ""}
                  onChange={(e) =>
                    setEnrollData((d) => ({
                      ...d,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Email</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                  type="email"
                  value={enrollData.email || ""}
                  onChange={(e) =>
                    setEnrollData((d) => ({
                      ...d,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Password</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                  type="password"
                  value={enrollData.password || ""}
                  onChange={(e) =>
                    setEnrollData((d) => ({
                      ...d,
                      password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              {enrollData.role === UserRole.STUDENT && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1">Register Number</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold uppercase"
                      value={enrollData.registerNumber || ""}
                      onChange={(e) =>
                        setEnrollData((d) => ({
                          ...d,
                          registerNumber: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="Department"
                      value={enrollData.department || ""}
                      onChange={(val) => setEnrollData(d => ({ ...d, department: val }))}
                      placeholder="Select Department"
                      options={[
                        { value: "CSE", label: "Computer Science" },
                        { value: "ECE", label: "Electronics & Communication" },
                        { value: "EEE", label: "Electrical & Electronics" },
                        { value: "ME", label: "Mechanical Engineering" },
                        { value: "CE", label: "Civil Engineering" }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Year</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                      value={enrollData.year || ""}
                      onChange={(e) =>
                        setEnrollData((d) => ({
                          ...d,
                          year: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 text-white rounded font-bold mt-2 disabled:opacity-50"
                disabled={enrollLoading}
              >
                {enrollLoading ? "Enrolling..." : "Enroll"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-gray-900">Attendance Log History</h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingLogs ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 font-medium">Fetching records...</p>
                </div>
              ) : (
                <>
                  {selectedUserLogs && selectedUserLogs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUserLogs.map((log) => (
                        <div key={log._id || log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {log.status === 'Present' ? <UserCheck size={18} /> : <X size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{log.mealType}</p>
                              <p className="text-xs text-gray-500">{log.date}</p>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${log.status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-white border border-red-200 text-red-500'}`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No attendance records found for this user.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-500 font-bold text-sm hover:text-gray-800"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500">
            No mess members found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
