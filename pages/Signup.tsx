import React, { useState } from "react";
import { User, UserRole } from "../types";
import {
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  ChefHat,
  Wrench,
  UtensilsCrossed,
  ArrowLeft,
  Mail,
  Fingerprint,
  AtSign,
} from "lucide-react";

interface SignupProps {
  onSignup: (user: User) => void;
  onToggleAuth: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onToggleAuth }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.STUDENT,
    registerNumber: "",
    department: "",
    position: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        return;
      }
      const user = await res.json();
      onSignup(user);
    } catch (err) {
      setError("Registration failed");
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const roles = [
    {
      id: UserRole.CHAIRMAN_SECRETARY,
      label: "Chairman / Secretary",
      icon: <ChefHat size={18} />,
      options: [
        { value: "CHAIRMAN", label: "Chairman" },
        { value: "SECRETARY", label: "Secretary" },
      ],
      colSpan: "col-span-2",
    },
    {
      id: UserRole.WARDEN_MATREN,
      label: "Warden / Matron",
      icon: <ShieldCheck size={18} />,
      options: [
        { value: "WARDEN", label: "Warden" },
        { value: "MATREN", label: "Matron" },
      ],
      colSpan: "col-span-2",
    },
    { id: UserRole.STAFF, label: "Staff", icon: <Wrench size={18} /> },
    { id: UserRole.STUDENT, label: "Student", icon: <UserIcon size={18} /> },
  ];

  const [subRole, setSubRole] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="max-w-xl w-full relative">
        <div className="mb-8">
          <button
            onClick={onToggleAuth}
            className="group flex items-center space-x-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-sm mb-6"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Login</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200">
              <UtensilsCrossed size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Enroll in GCEK HMMS
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-300/40 border border-white/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm font-bold text-center">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                Select Your Role
              </p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <div key={role.id} className={`flex flex-col items-center ${role.colSpan || 'col-span-1'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleChange(role.id);
                        setSubRole("");
                      }}
                      className={`w-full flex flex-col items-center justify-center space-y-2 py-4 px-2 rounded-2xl border-2 transition-all duration-300 ${formData.role === role.id
                        ? `border-emerald-600 bg-emerald-50 text-emerald-700 font-black scale-[1.05] shadow-lg shadow-emerald-100`
                        : "border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50"
                        }`}
                    >
                      {role.icon}
                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                        {role.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Email Address
                </label>
                <div className="relative">
                  <AtSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                    placeholder="name@gcek.ac.in"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  Password
                </label>
                <div className="relative">
                  <Fingerprint
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Position dropdown for multi-named roles, now in details form */}
              {(formData.role === UserRole.CHAIRMAN_SECRETARY ||
                formData.role === UserRole.WARDEN_MATREN) && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      Position
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.position}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                        }}
                      >
                        <option value="">Select Position</option>
                        {formData.role === UserRole.CHAIRMAN_SECRETARY && (
                          <>
                            <option value="Chairman">Chairman</option>
                            <option value="Secretary">Secretary</option>
                          </>
                        )}
                        {formData.role === UserRole.WARDEN_MATREN && (
                          <>
                            <option value="Warden">Warden</option>
                            <option value="Matren">Matron</option>
                          </>
                        )}
                      </select>
                      {/* Custom dropdown arrow */}
                      <svg
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                )}

              {formData.role === UserRole.STUDENT && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      Register Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.registerNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registerNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold"
                      placeholder="KNR21CS045"
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      Department
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      <option value="CSE">Computer Science</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="EEE">Electrical & Electronics</option>
                      <option value="ME">Mechanical Engineering</option>
                      <option value="CE">Civil Engineering</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-5 mt-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center space-x-3 group"
            >
              <UserPlus size={22} />
              <span>Create My Account</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Already have an account?{" "}
            <button
              onClick={onToggleAuth}
              className="text-emerald-600 font-bold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
