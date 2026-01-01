
import React, { useState, useEffect } from 'react';
import { User, UserRole, MealType, AttendanceRecord } from '../types';
import { Calendar, Search, Check, X, Download, Utensils } from 'lucide-react';

const Attendance: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [students, setStudents] = useState<User[]>([]);
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, attendanceRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/attendance')
        ]);

        const users = await usersRes.json();
        const attendance = await attendanceRes.json();

        const studentList = users.filter((u: User) => u.role === UserRole.STUDENT);
        setStudents(studentList);

        // Map existing attendance for this date/meal
        const currentRecords: Record<string, 'Present' | 'Absent'> = {};
        const sessionAttendance = attendance.filter((a: any) =>
          a.date === date && a.mealType === mealType
        );

        studentList.forEach(s => {
          const studentId = s.id || s._id;
          const record = sessionAttendance.find((a: any) =>
            (a.studentId === studentId) || (a.studentId && a.studentId._id === studentId)
          );
          currentRecords[studentId!] = record ? record.status : 'Present';
        });

        setRecords(currentRecords);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [date, mealType]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create attendance records for each student
      const promises = students.map(student => {
        const status = records[student.id || student._id];
        return fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id || student._id,
            studentName: student.name,
            mealType,
            status,
            date
          })
        });
      });

      await Promise.all(promises);
      alert('Attendance submitted successfully');
    } catch (err) {
      console.error('Failed to submit attendance', err);
      alert('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = ["Mess Card ID", "Name", "Department", "Status", "Meal Type", "Date"];
    const csvContent = [
      headers.join(","),
      ...students.map(student => {
        const id = student.id || student._id;
        return [
          student.messCardId || 'N/A',
          `"${student.name}"`, // Quote name to handle potential commas
          student.department || '',
          records[id] || 'Absent',
          mealType,
          date.split('-').reverse().join('-')
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${date}_${mealType}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const totalCount = students.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mess Attendance</h2>
          <p className="text-gray-500">Track meal consumption and student presence.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(meal => (
            <button
              key={meal}
              onClick={() => setMealType(meal)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mealType === meal ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-gray-100 flex items-center justify-center mb-4">
              <div className="text-center">
                <span className="text-xl font-bold text-emerald-600">{totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900">{mealType} Coverage</p>
            <p className="text-xs text-gray-500 mt-1">{presentCount} of {totalCount} students marked</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Calendar size={16} className="mr-2 text-emerald-600" />
              Session Date
            </h3>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 font-bold disabled:opacity-50"
          >
            <Check size={18} />
            <span>{submitting ? 'Submitting...' : `Submit ${mealType} Logs`}</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search mess ID or name..." className="pl-9 pr-4 py-2 w-full border border-gray-100 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              <Download size={14} />
              <span>Export Today's Sheet</span>
            </button>
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Mess Member</th>
                  <th className="px-6 py-4">Mess Card ID</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(student => {
                  const id = student.id || student._id;
                  return (
                    <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-100">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{student.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-medium">{student.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{student.messCardId || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setRecords(prev => ({ ...prev, [id]: 'Present' }))}
                            className={`w-24 flex items-center justify-center space-x-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${records[id] === 'Present'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                              }`}
                          >
                            <Check size={14} />
                            <span>Present</span>
                          </button>
                          <button
                            onClick={() => setRecords(prev => ({ ...prev, [id]: 'Absent' }))}
                            className={`w-24 flex items-center justify-center space-x-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${records[id] === 'Absent'
                              ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-100'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                              }`}
                          >
                            <X size={14} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
