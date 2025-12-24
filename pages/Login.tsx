import React, { useState } from "react";
import { User, UserRole } from "../types";

import {
  LogIn,
  ShieldCheck,
  User as UserIcon,
  ChefHat,
  Wrench,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";

interface LoginProps {
  onLogin: (user: User) => void;
  onToggleAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onToggleAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      onLogin(data.user);
      // Optionally, store data.token for authenticated requests
    } catch (err) {
      setError("Login failed");
    }
  };

  const roles = [
    {
      id: UserRole.CHAIRMAN_SECRETARY,
      label: "Chairman / Secretary",
      icon: <ChefHat size={18} />,
      colSpan: "col-span-2",
    },
    {
      id: UserRole.WARDEN_MATREN,
      label: "Warden / Matron",
      icon: <ShieldCheck size={18} />,
      colSpan: "col-span-2",
    },
    {
      id: UserRole.STAFF,
      label: "Staff",
      icon: <Wrench size={18} />
    },
    {
      id: UserRole.STUDENT,
      label: "Student",
      icon: <UserIcon size={18} />
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="max-w-md w-full relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-5 bg-emerald-600 rounded-[2.5rem] shadow-2xl shadow-emerald-600/30 mb-8 transform transition-transform hover:rotate-6">
            <UtensilsCrossed size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            GCEK Mess
          </h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">
            Portal Authentication
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-300/40 border border-white/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="text-red-500 text-sm font-bold text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">
                Access Level
              </p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center justify-center space-x-2 py-3.5 px-2 rounded-2xl border-2 transition-all duration-300 ${role.colSpan || 'col-span-1'} ${selectedRole === role.id
                      ? `border-emerald-600 bg-emerald-50 text-emerald-700 font-black shadow-sm scale-[1.02]`
                      : "border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                    {role.icon}
                    <span className="text-[11px] font-bold">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-7 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-7 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] font-black p-4 rounded-2xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center space-x-3 group"
            >
              <span>Sign In</span>
              <LogIn
                size={22}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button
              onClick={onToggleAuth}
              className="group inline-flex items-center text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors"
            >
              Don't have an account?
              <span className="ml-1 text-emerald-600 group-hover:underline flex items-center">
                Sign up now{" "}
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
