import React, { useState, useEffect } from "react";
import { User, UserRole, MessMenu } from "../types";
import {
    FileText,
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    AlertCircle,
    IndianRupee,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import CustomDropdown from "../components/CustomDropdown";

interface MessReportProps {
    user: User;
}

const MessReport: React.FC<MessReportProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'inventory'>('daily');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // This would ideally be a dedicated API endpoint that aggregates data
    // For now, we'll simulate fetching report data or use existing endpoints
    useEffect(() => {
        fetchReportData();
    }, [activeTab, currentDate, selectedMonth]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // In a real app, you'd call specific report endpoints:
            // const res = await fetch(`/api/reports?type=${activeTab}&date=${currentDate}&month=${selectedMonth}`);

            // For this demo, let's pull from existing "raw" endpoints and Aggregate client-side 
            // (Not recommended for production with large data, but works for MVP)

            const [attendanceRes, resourcesRes, menuRes, usersRes] = await Promise.all([
                fetch('/api/attendance'),
                fetch('/api/resources'),
                fetch('/api/menu'), // This might need filter adjustment
                fetch('/api/users')
            ]);

            const attendance = await attendanceRes.json();
            const resources = await resourcesRes.json();
            const menu = await menuRes.json();
            const users = await usersRes.json();

            processData({ attendance, resources, menu, users });
        } catch (err) {
            console.error("Failed to load report data", err);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data: any) => {
        // 1. Calculate Daily Stats
        const dailyAttendance = data.attendance.filter((a: any) => a.date === currentDate);
        const presentCount = dailyAttendance.filter((a: any) => a.status === 'Present').length;
        const totalStudents = data.users.filter((u: User) => u.role === UserRole.STUDENT).length;

        // 2. Calculate Monthly Stats
        // Filter attendance for selected month
        const monthlyAttendance = data.attendance.filter((a: any) => a.date?.startsWith(selectedMonth));
        const avgAttendance = monthlyAttendance.length > 0 ? Math.round(monthlyAttendance.filter((a: any) => a.status === 'Present').length / 30) : 0; // Simplified

        // Cost Calculations (Estimated based on resources)
        const totalInventoryValue = data.resources.reduce((acc: number, r: any) => acc + (r.quantity * (r.pricePerUnit || 0)), 0);
        const monthlyConsumptionCost = data.resources.reduce((acc: number, r: any) => acc + ((r.monthlyUsage || 0) * (r.pricePerUnit || 0)), 0);

        setReportData({
            daily: {
                present: presentCount,
                absent: totalStudents - presentCount,
                total: totalStudents,
                attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0,
                // Mock cost per student
                costPerHead: 145,
                totalCost: presentCount * 145
            },
            monthly: {
                avgAttendance,
                totalMealsServed: monthlyAttendance.filter((a: any) => a.status === 'Present').length,
                consumptionCost: monthlyConsumptionCost,
                costPerStudent: totalStudents > 0 ? Math.round(monthlyConsumptionCost / totalStudents) : 0,
                wastageRate: 5 // Mock percentage
            },
            inventory: {
                totalValue: totalInventoryValue,
                lowStockItems: data.resources.filter((r: any) => r.quantity <= r.threshold).length,
                mostUsedCategory: 'Vegetables' // Mock
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading || !reportData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12 print:p-0 print:max-w-none">
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">GCEK Hostel Mess</h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">Government College of Engineering, Kannur</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Generated On</p>
                        <p className="text-lg font-black text-slate-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-end">
                    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide border-l-4 border-slate-900 pl-3">
                        {activeTab === 'daily' ? 'Daily Operations Report' : activeTab === 'monthly' ? 'Monthly Financial Statement' : 'Inventory Audit Report'}
                    </h2>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">Official Document</span>
                </div>
            </div>

            {/* Header - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Mess Reports & Analytics
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Comprehensive insights into attendance, finance, and inventory.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        <span>Export / Print</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-fit print:hidden">
                {[
                    { id: 'daily', label: 'Daily Report', icon: FileText },
                    { id: 'monthly', label: 'Monthly Overview', icon: Calendar },
                    { id: 'inventory', label: 'Inventory Audit', icon: AlertCircle }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-md shadow-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">

                {/* DAILY REPORT VIEW */}
                {activeTab === 'daily' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <FileText className="mr-3 text-blue-500" />
                                    Daily Operations Summary
                                </h3>
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Attendance Card */}
                                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Attendance</span>
                                        <Users size={18} className="text-indigo-500" />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-indigo-900">{reportData.daily.present}</span>
                                        <span className="text-sm font-bold text-indigo-400 mb-1.5">/ {reportData.daily.total}</span>
                                    </div>
                                    <div className="mt-4 w-full bg-white rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${reportData.daily.attendanceRate}%` }}></div>
                                    </div>
                                    <p className="mt-2 text-xs font-bold text-indigo-500">{reportData.daily.attendanceRate}% Present Today</p>
                                </div>

                                {/* Cost Card */}
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Est. Daily Cost</span>
                                        <TrendingUp size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-black text-emerald-900">₹{reportData.daily.totalCost}</span>
                                    </div>
                                    <p className="mt-4 text-xs font-bold text-emerald-600">Based on consumption</p>
                                    <p className="text-[10px] font-medium text-emerald-400">Avg ₹{reportData.daily.costPerHead} per head</p>
                                </div>

                                {/* Meals Breakdown (Mock for now) */}
                                <div className="col-span-1 md:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl">
                                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Meal-wise Distribution</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-500">Breakfast</span>
                                            <span className="font-black text-slate-900">{Math.round(reportData.daily.present * 0.9)} served</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div className="bg-orange-400 h-full rounded-full" style={{ width: '90%' }}></div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-500">Lunch</span>
                                            <span className="font-black text-slate-900">{reportData.daily.present} served</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }}></div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-500">Dinner</span>
                                            <span className="font-black text-slate-900">{Math.round(reportData.daily.present * 0.85)} served</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MONTHLY REPORT VIEW */}
                {activeTab === 'monthly' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <Calendar className="mr-3 text-purple-500" />
                                    Monthly Financial Overview
                                </h3>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Expenses</p>
                                    <p className="text-4xl font-black text-slate-900">₹{reportData.monthly.consumptionCost.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-red-500 mt-2 flex items-center">
                                        <TrendingDown size={12} className="mr-1" />
                                        12% increase from last month
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cost Per Student</p>
                                    <p className="text-4xl font-black text-slate-900">₹{reportData.monthly.costPerStudent.toLocaleString()}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-2">Target: ₹3,500</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Meals Served</p>
                                    <p className="text-4xl font-black text-slate-900">{reportData.monthly.totalMealsServed.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center">
                                        <TrendingUp size={12} className="mr-1" />
                                        Consistent attendance
                                    </p>
                                </div>
                            </div>

                            {/* Mock Chart Area */}
                            {/* Chart Area */}
                            <div className="h-80 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm">Monthly Expenditure Trend</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'Week 1', amount: 45000 },
                                            { name: 'Week 2', amount: 52000 },
                                            { name: 'Week 3', amount: 48000 },
                                            { name: 'Week 4', amount: 61000 },
                                        ]}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Expenses']}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#8b5cf6"
                                            radius={[6, 6, 0, 0]}
                                            barSize={60}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* INVENTORY REPORT VIEW */}
                {activeTab === 'inventory' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <AlertCircle className="mr-3 text-orange-500" />
                                    Inventory Audit Report
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Stock Value</p>
                                            <p className="text-3xl font-black text-orange-900">₹{reportData.inventory.totalValue.toLocaleString()}</p>
                                        </div>
                                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                                            <IndianRupee size={20} />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Low Stock Items</p>
                                            <p className="text-3xl font-black text-red-900">{reportData.inventory.lowStockItems}</p>
                                            <p className="text-xs font-medium text-red-600 mt-1">Immediate action required</p>
                                        </div>
                                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                            <AlertCircle size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-6">Recommendations</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            The usage of {reportData.inventory.mostUsedCategory} is 15% higher than average. Consider bulk purchasing.
                                        </li>
                                        <li className="flex items-start text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            {reportData.inventory.lowStockItems} items are below safe threshold levels. Reorder immediately to avoid shortages.
                                        </li>
                                        <li className="flex items-start text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Current stock value is optimized. Maintain current purchasing schedule.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Footer */}
                <div className="hidden print:block mt-12 pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                        <div className="text-[10px] text-slate-400 font-medium">
                            <p>Generated by HMMS (Hostel Mess Management System)</p>
                            <p>Confidential • Internal Use Only</p>
                        </div>
                        <div className="flex space-x-12">
                            <div className="text-center">
                                <div className="h-12 w-32 border-b border-slate-300 mb-2"></div>
                                <p className="text-[10px] font-bold uppercase text-slate-500">Mess Secretary</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-32 border-b border-slate-300 mb-2"></div>
                                <p className="text-[10px] font-bold uppercase text-slate-500">Warden</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MessReport;
