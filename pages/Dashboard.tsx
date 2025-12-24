import React, { useEffect, useState } from "react";
import { User, UserRole } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Utensils,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  Sparkles,
  PlusCircle,
  FileText,
  Megaphone,
} from "lucide-react";

const mealAttendanceData = [
  { name: "Mon", breakfast: 320, lunch: 410, dinner: 380 },
  { name: "Tue", breakfast: 340, lunch: 430, dinner: 395 },
  { name: "Wed", breakfast: 310, lunch: 420, dinner: 405 },
  { name: "Thu", breakfast: 330, lunch: 440, dinner: 415 },
  { name: "Fri", breakfast: 350, lunch: 480, dinner: 440 },
  { name: "Sat", breakfast: 280, lunch: 320, dinner: 300 },
  { name: "Sun", breakfast: 250, lunch: 300, dinner: 280 },
];

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  trend?: string;
}> = ({ title, value, icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col group hover:scale-[1.02] transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-lg`}>
        {icon}
      </div>
      {trend && (
        <span
          className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${trend.startsWith("+")
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
      {title}
    </h3>
    <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers);
    fetch("/api/resources")
      .then((res) => res.json())
      .then(setResources);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then(setAnnouncements);
    fetch("/api/complaints")
      .then((res) => res.json())
      .then(setComplaints);
  }, []);

  const lowStockResources = resources.filter(
    (r: any) => r.quantity <= r.threshold
  );
  const totalMessMembers = users.filter(
    (u: any) => u.messStatus === "Active"
  ).length;

  const isAdmin =
    user.role === UserRole.CHAIRMAN_SECRETARY ||
    user.role === UserRole.WARDEN_MATREN;

  return (
    <div
      className="space-y-8 max-w-7xl mx-auto pb-12"
      onClick={() => {
        if (showQuickActions) setShowQuickActions(false);
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Sparkles size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Live Insights
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            G'day, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 font-medium">
            The mess is currently serving{" "}
            <span className="text-emerald-600 font-bold">Lunch</span>. 412
            served so far.
          </p>
        </div>
        <div className="flex items-center space-x-4 relative">
          <button
            onClick={() => setActiveTab("attendance")}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
          >
            View Analytics
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickActions(!showQuickActions);
              }}
              className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center space-x-2"
            >
              <span>Quick Entry</span>
              {showQuickActions ? (
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              ) : null}
            </button>
            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setActiveTab("complaints")}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <span className="text-xs font-bold">New Complaint</span>
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setActiveTab("announcements")}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Megaphone size={16} />
                      </div>
                      <span className="text-xs font-bold">Post Notice</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("mess-members")}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <PlusCircle size={16} />
                      </div>
                      <span className="text-xs font-bold">Add Member</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Members"
          value={totalMessMembers.toString()}
          icon={<Users size={22} />}
          colorClass="bg-emerald-600 shadow-emerald-200"
          trend="+14 this month"
        />
        <StatCard
          title="Lunch Served"
          value="412"
          icon={<Utensils size={22} />}
          colorClass="bg-slate-900 shadow-slate-300"
        />
        <StatCard
          title="Attendance Rate"
          value="82.4%"
          icon={<ClipboardList size={22} />}
          colorClass="bg-indigo-600 shadow-indigo-200"
          trend="+3.2%"
        />
        <StatCard
          title="Stock Warnings"
          value={lowStockResources.length.toString()}
          icon={<AlertTriangle size={22} />}
          colorClass="bg-amber-500 shadow-amber-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Charts */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
                <TrendingUp size={20} className="mr-3 text-emerald-600" />
                Consumption Trends
              </h3>
              <div className="flex items-center space-x-4 text-[10px] uppercase font-extrabold tracking-widest text-slate-400">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div>{" "}
                  Breakfast
                </div>
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></div>{" "}
                  Lunch
                </div>
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></div>{" "}
                  Dinner
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mealAttendanceData}>
                  <defs>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="breakfast"
                    stroke="#10b981"
                    strokeWidth={4}
                    fill="url(#colorB)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lunch"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fill="url(#colorL)"
                  />
                  <Area
                    type="monotone"
                    dataKey="dinner"
                    stroke="#6366f1"
                    strokeWidth={4}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-slate-900">
                  Critical Stock
                </h3>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="text-emerald-600 text-xs font-bold hover:underline underline-offset-4"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-4">
                {lowStockResources.map((item: any) => (
                  <div
                    key={item._id || item.id}
                    className="group flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-all cursor-pointer"
                    onClick={() => setActiveTab("inventory")}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mr-4 text-red-600 group-hover:scale-110 transition-transform">
                        <TrendingDown size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-red-500 font-bold">
                          {item.quantity}
                          {item.unit} left
                        </p>
                      </div>
                    </div>
                    <button className="p-2 bg-white text-red-600 rounded-xl border border-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-slate-900">User Feedback</h3>
                <button
                  onClick={() => setActiveTab("complaints")}
                  className="text-emerald-600 text-xs font-bold hover:underline underline-offset-4"
                >
                  History
                </button>
              </div>
              <div className="space-y-4">
                {complaints.slice(0, 2).map((complaint: any) => (
                  <div
                    key={complaint._id || complaint.id}
                    className="p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all group cursor-pointer"
                    onClick={() => setActiveTab("complaints")}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${complaint.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {complaint.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {complaint.createdAt}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                      {complaint.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">
                      {complaint.studentName} • {complaint.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-950 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-black text-2xl mb-2">Notice Board</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">
              Important updates from the Warden.
            </p>
            <div className="space-y-6">
              {announcements.map((ann: any) => (
                <div
                  key={ann._id || ann.id}
                  className="relative pl-6 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-emerald-500 before:rounded-full"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                      {ann.date}
                    </span>
                    {ann.priority === "High" && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab("announcements")}
              className="mt-10 w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-sm transition-all flex items-center justify-center shadow-xl shadow-emerald-600/20"
            >
              View Full Board
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
            <h3 className="font-extrabold text-slate-900 mb-6">Quick Totals</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                    Daily Budget
                  </p>
                  <p className="text-2xl font-black text-slate-900">₹18,450</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100">
                  <TrendingUp size={22} />
                </div>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]" />
              </div>
              <p className="text-[11px] text-slate-400 font-bold">
                65% of monthly budget utilized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
