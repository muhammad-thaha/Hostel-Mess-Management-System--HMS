
import React, { useState } from 'react';
import { User, UserRole, Announcement } from '../types';
import { MOCK_ANNOUNCEMENTS } from '../constants';
import { Bell, Plus, MoreVertical, Flag, Calendar as CalIcon } from 'lucide-react';

interface AnnouncementsProps {
  user: User;
}

const Announcements: React.FC<AnnouncementsProps> = ({ user }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.MESS_MANAGER;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campus Announcements</h2>
          <p className="text-gray-500">Official updates from hostel and mess management.</p>
        </div>
        {isAdmin && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
            <Plus size={18} />
            <span className="font-semibold text-sm">Post Update</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {announcements.map((ann, idx) => (
          <div key={ann.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${ann.priority === 'High' ? 'ring-2 ring-red-100' : ''}`}>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${ann.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {ann.priority === 'High' ? <Flag size={24} /> : <Bell size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">{ann.title}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center">
                        <CalIcon size={12} className="mr-1" />
                        {ann.date}
                      </span>
                      <span>•</span>
                      <span>By {ann.author}</span>
                    </div>
                  </div>
                </div>
                {ann.priority === 'High' && (
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full self-start sm:self-center shadow-lg shadow-red-100 animate-pulse">
                    Urgent
                  </span>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed text-base">
                {ann.content}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                      U{i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    +42
                  </div>
                  <span className="ml-4 text-[10px] text-gray-400 font-medium self-center">Read by 45 students</span>
                </div>
                {isAdmin && (
                  <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
