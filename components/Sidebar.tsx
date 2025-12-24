
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, UtensilsCrossed } from 'lucide-react';

interface SidebarProps {
  items: Array<{ id: string; label: string; icon: React.ReactNode }>;
  activeTab: string;
  setActiveTab: (id: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeTab, setActiveTab, user, onLogout }) => {
  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20">
      <div className="p-8 flex items-center space-x-4">
        <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
          <UtensilsCrossed size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">GCEK</h1>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none">Mess Portal</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
          >
            <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`}>
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 m-4 rounded-3xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
              {(user.role === UserRole.CHAIRMAN_SECRETARY || user.role === UserRole.WARDEN_MATREN) && user.position
                ? user.position
                : user.role.replace('_', ' / ')}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-xl transition-all duration-300 border border-slate-800 group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
