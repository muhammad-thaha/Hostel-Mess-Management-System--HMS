import React, { useEffect, useState } from "react";
import { User, UserRole } from "../types";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  CreditCard,
  UserCheck,
  Filter,
} from "lucide-react";

const ALL_ROLES = [
  { label: "All", value: "ALL" },
  { label: "Student", value: UserRole.STUDENT },
  { label: "Staff", value: UserRole.STAFF },
  { label: "Warden", value: "WARDEN" },
  { label: "Manager", value: UserRole.MESS_MANAGER },
  { label: "Admin", value: UserRole.ADMIN },
];

const StudentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setMembers([]));
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesRole =
      roleFilter === "ALL"
        ? true
        : m.role === roleFilter ||
          (roleFilter === "WARDEN" && m.role === "WARDEN");
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.messCardId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Mess Members Directory
          </h2>
          <p className="text-gray-500 text-sm">
            Review all mess members and manage cards.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100">
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
          <div className="flex items-center space-x-2">
            <Filter size={18} />
            <select
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ALL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button className="flex-1 md:flex-none px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black">
            Attendance Summary
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500">Loading members...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id || member._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {member.registerNumber || member.role}{" "}
                          {member.year ? `• ${member.year} Year` : ""}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Mess Card
                      </p>
                      <div className="flex items-center text-xs font-bold text-slate-800">
                        <CreditCard
                          size={12}
                          className="mr-1.5 text-blue-500"
                        />
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
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="text-[10px] font-bold text-gray-400 uppercase mr-3">
                        Dept:
                      </span>
                      <span className="font-medium text-gray-700">
                        {member.department || "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Role: {member.role}
                  </span>
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredMembers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500">
                No mess members found matching your search.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentManagement;
