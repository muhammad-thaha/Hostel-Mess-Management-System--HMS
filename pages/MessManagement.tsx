import React, { useEffect, useState } from "react";
import { User, UserRole, MessMenu } from "../types";
import { Utensils, Edit3, Clock, Calendar, ChefHat, Sparkles } from "lucide-react";

interface MessManagementProps {
  user: User;
}

const MessManagement: React.FC<MessManagementProps> = ({ user }) => {
  const [currentMenu, setCurrentMenu] = useState<MessMenu[]>([]);
  const [upcomingMenu, setUpcomingMenu] = useState<MessMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<"current" | "upcoming">(
    "current"
  );
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState<MessMenu[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [generatingMenu, setGeneratingMenu] = useState(false);

  const generateAiMenu = async () => {
    setGeneratingMenu(true);
    try {
      const res = await fetch('/api/ai/menu-plan', { method: 'POST' });
      const data = await res.json();

      if (Array.isArray(data)) {
        // Transform AI data to match our type if needed
        const newMenu = data.map((d: any) => ({
          ...d,
          type: 'upcoming'
        }));
        setUpcomingMenu(newMenu);
        // Automatically open edit modal to let user review/save
        setEditMenu(newMenu);
        setShowModal(true);
      } else {
        alert("AI generated an invalid format.");
      }
    } catch (err) {
      console.error("AI Menu Error", err);
      alert("Failed to generate AI menu. Please try again.");
    } finally {
      setGeneratingMenu(false);
    }
  };

  // Helper to determine if user is manager
  const isManager = user.role === UserRole.CHAIRMAN_SECRETARY || user.role === UserRole.WARDEN_MATREN;

  const handleSaveMenu = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu?type=${selectedMenu}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMenu),
      });
      if (!res.ok) {
        throw new Error("Failed to update menu");
      }
      // Update UI with new menu
      if (selectedMenu === "current") {
        setCurrentMenu(editMenu);
      } else {
        setUpcomingMenu(editMenu);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Error updating menu");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = () => {
    setEditMenu(selectedMenu === "current" ? currentMenu : upcomingMenu);
    setShowModal(true);
    setError(null);
  };

  const handleMenuChange = (
    idx: number,
    field: keyof MessMenu,
    value: string
  ) => {
    setEditMenu((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  useEffect(() => {
    // Fetch current week's menu
    fetch("/api/menu?type=current")
      .then((res) => res.json())
      .then((data) => setCurrentMenu(data))
      .catch(() => setCurrentMenu([]));
    // Fetch upcoming week's menu
    fetch("/api/menu?type=upcoming")
      .then((res) => res.json())
      .then((data) => setUpcomingMenu(data))
      .catch(() => setUpcomingMenu([]));
    // Fetch mess members
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  const [timings, setTimings] = useState([
    {
      label: "Breakfast",
      time: "07:30 AM - 09:00 AM",
      icon: "🍳",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Lunch",
      time: "12:30 PM - 02:00 PM",
      icon: "🍚",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Tea",
      time: "04:30 PM - 05:30 PM",
      icon: "☕",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Dinner",
      time: "07:30 PM - 09:00 PM",
      icon: "🍲",
      color: "bg-indigo-100 text-indigo-700",
    },
  ]);
  const [showTimingsModal, setShowTimingsModal] = useState(false);
  const [editTimings, setEditTimings] = useState(timings);

  const handleSaveTimings = () => {
    setTimings(editTimings);
    setShowTimingsModal(false);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mess Schedule
          </h2>
          <p className="text-slate-500 font-medium">
            Updated weekly menu for GCEK residents.
          </p>
        </div>
        {isManager && (
          <button
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center group"
            onClick={handleOpenModal}
          >
            <Edit3
              size={18}
              className="mr-3 group-hover:rotate-12 transition-transform"
            />
            Update Menu
          </button>
        )}
        {/* Update Menu Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
              <h2 className="text-xl font-black mb-4">
                Edit {selectedMenu === "current" ? "Current" : "Upcoming"}{" "}
                Weekly Spread
              </h2>
              {error && (
                <div className="text-red-600 font-bold mb-2">{error}</div>
              )}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {editMenu.map((day, idx) => (
                  <div
                    key={day.day}
                    className="flex flex-col md:flex-row md:items-center gap-2 border-b pb-2"
                  >
                    <span className="w-24 font-bold uppercase">{day.day}</span>
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={day.breakfast}
                      onChange={(e) =>
                        handleMenuChange(idx, "breakfast", e.target.value)
                      }
                      placeholder="Breakfast"
                    />
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={day.lunch}
                      onChange={(e) =>
                        handleMenuChange(idx, "lunch", e.target.value)
                      }
                      placeholder="Lunch"
                    />
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={day.dinner}
                      onChange={(e) =>
                        handleMenuChange(idx, "dinner", e.target.value)
                      }
                      placeholder="Dinner"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 rounded bg-slate-200 font-bold hover:bg-slate-300"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                  onClick={handleSaveMenu}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Schedule Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 flex items-center">
                <Clock size={22} className="mr-3 text-emerald-600" />
                Service Timings
              </h3>
              {isManager && (
                <button
                  onClick={() => {
                    setEditTimings(timings);
                    setShowTimingsModal(true);
                  }}
                  className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                  title="Edit Timings"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-6">
              {timings.map((t) => (
                <div
                  key={t.label}
                  className="group flex items-center p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-default"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${t.color} flex items-center justify-center text-2xl shadow-sm mr-5 group-hover:scale-110 transition-transform`}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                      {t.label}
                    </p>
                    <p className="text-sm font-extrabold text-slate-800">
                      {t.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Timings Modal */}
          {showTimingsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
                <h3 className="font-black text-xl mb-6 text-slate-900">Edit Service Timings</h3>
                <div className="space-y-4">
                  {editTimings.map((t, idx) => (
                    <div key={t.label}>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">{t.label}</label>
                      <input
                        type="text"
                        value={t.time}
                        onChange={(e) => {
                          const updated = [...editTimings];
                          updated[idx] = { ...updated[idx], time: e.target.value };
                          setEditTimings(updated);
                        }}
                        className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowTimingsModal(false)}
                    className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTimings}
                    className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
            <div className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
              <ChefHat size={160} />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-3">Kitchen News</h3>
              <p className="text-emerald-100 text-sm mb-6 leading-relaxed font-medium">
                GCEK Mess uses locally sourced organic vegetables from Kannur
                markets.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-xl text-xs font-bold border border-white/20">
                #HealthyCampus
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 flex items-center">
                <Calendar size={22} className="mr-3 text-emerald-600" />
                Weekly Spread
              </h3>
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 items-center">
                <button
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${selectedMenu === "current"
                    ? "text-emerald-600 bg-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                  onClick={() => setSelectedMenu("current")}
                >
                  Current
                </button>
                <button
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${selectedMenu === "upcoming"
                    ? "text-emerald-600 bg-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                  onClick={() => setSelectedMenu("upcoming")}
                >
                  Upcoming
                </button>
              </div>
            </div>

            {/* AI Menu Generator Button - Only visible for managers on Upcoming tab */}
            {isManager && selectedMenu === 'upcoming' && (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={generateAiMenu}
                  disabled={generatingMenu}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed text-xs"
                >
                  {generatingMenu ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>{generatingMenu ? 'Designing Menu...' : 'Auto-Plan with AI'}</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              {(selectedMenu === "current" ? currentMenu : upcomingMenu).map(
                (day) => (
                  <div
                    key={day.day}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div className="md:col-span-2 flex items-center">
                      <span className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-widest text-xs">
                        {day.day}
                      </span>
                    </div>
                    <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-emerald-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Breakfast
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {day.breakfast}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-emerald-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Lunch
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {day.lunch}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-emerald-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Dinner
                        </p>
                        <p className="text-xs font-bold text-slate-700">
                          {day.dinner}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessManagement;
