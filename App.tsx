
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from './types';
import { NAV_ITEMS } from './constants';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentManagement from './pages/StudentManagement';
import MessManagement from './pages/MessManagement';
import Inventory from './pages/Inventory';
import ComplaintSystem from './pages/ComplaintSystem';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';

type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('hmms_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hmms_user', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hmms_user');
    setAuthView('login');
    setActiveTab('dashboard');
  };

  const filteredNavItems = useMemo(() => {
    if (!currentUser) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-500 font-bold tracking-[0.2em] text-[10px] uppercase">GCEK HMMS Engine Starting</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return authView === 'login' 
      ? <Login onLogin={handleLogin} onToggleAuth={() => setAuthView('signup')} /> 
      : <Signup onSignup={handleLogin} onToggleAuth={() => setAuthView('login')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} setActiveTab={setActiveTab} />;
      case 'mess-members':
        return <StudentManagement />;
      case 'mess-menu':
        return <MessManagement user={currentUser} />;
      case 'inventory':
        return <Inventory user={currentUser} />;
      case 'complaints':
        return <ComplaintSystem user={currentUser} />;
      case 'attendance':
        return <Attendance />;
      case 'announcements':
        return <Announcements user={currentUser} />;
      case 'reports':
        return (
          <div className="p-12 text-center text-slate-500 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Analytics & Reports</h2>
            <p className="font-medium">Detailed consumption data and financial audits for {new Date().getFullYear()}.</p>
          </div>
        );
      default:
        return <div className="p-8 text-center text-slate-400 font-bold">Module under active development.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar 
        items={filteredNavItems} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={currentUser} activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
