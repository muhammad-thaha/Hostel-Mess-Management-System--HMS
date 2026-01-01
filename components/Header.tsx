
import React from 'react';
import { User } from '../types';
import { Search, Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  user: User;
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab }) => {
  const getTitle = () => {
    const tabName = activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return tabName;
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm z-10 print:hidden">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search documents, students..."
            className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
