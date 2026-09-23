import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AttendanceRecord, Employee, SalaryRecord } from '../../types';
import {
  formatCurrencyTomans,
  formatNumberFa,
  getTodayShamsi,
  minutesToHoursAndMinutes
} from '../../utils/dateUtils';

interface ReportsViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  salaries: SalaryRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  attendance,
  salaries,
}) => {
  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees.filter(
    (e) => selectedDept === 'ALL' || e.department === selectedDept
  );

  // Summary Metrics
  const totalEmployees = filteredEmployees.length;
  const filteredIds = new Set(filteredEmployees.map((e) => e.id));

  const relevantAttendance = attendance.filter((a) => filteredIds.has(a.employeeId));
  const totalLates = relevantAttendance.reduce((sum, a) => sum + (a.lateMinutes > 0 ? 1 : 0), 0);
  const totalLateMinutes = relevantAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
  const totalOvertimeMinutes = relevantAttendance.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);
  const totalAbsents = relevantAttendance.filter((a) => a.status === 'ABSENT').length;

  // Department comparative data for chart
  const deptSummaryData = [
    { name: 'فناوری و مهندسی', حضور: 96, تاخیر: 4, اضافه_کاری: 38 },
    { name: 'منابع انسانی', حضور: 100, تاخیر: 0, اضافه_کاری: 12 },
    { name: 'طراحی محصول', حضور: 92, تاخیر: 8, اضافه_کاری: 15 },
    { name: 'مالی و حسابداری', حضور: 98, تاخیر: 2, اضافه_کاری: 24 },
    { name: 'پشتیبانی و فروش', حضور: 90, تاخیر: 10, اضافه_کاری: 30 },
  ];

  // CSV Export feature
  const exportToCsv = () => {
    const headers = [
      'کد پرسنلی',
      'نام و نام خانوادگی',
      'واحد سازمانی',
      'سمت',
      'حقوق پایه (تومان)',
      'وضعیت',
    ];

    const rows = filteredEmployees.map((e) => [
      e.personalCode,
      `"${e.firstName} ${e.lastName}"`,
      `"${e.department}"`,
      `"${e.position}"`,
      e.baseSalary,
      e.status === 'ACTIVE' ? 'فعال' : 'غیرفعال',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HRM_Report_${getTodayShamsi().replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>مرکز گزارش‌های تحلیلی، حضور و عملکرد کارکنان</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            گزارش‌های روزانه، هفتگی و ماهانه شامل حضور، تأخیرها، اضافه‌کاری و هزینه‌های حقوق با امکان خروجی اکسل و چاپ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>خروجی Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>چاپ گزارش جامع (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter and Period Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Report Period Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setReportType('DAILY')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'DAILY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش روزانه
          </button>
          <button
            onClick={() => setReportType('WEEKLY')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'WEEKLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش هفتگی
          </button>
          <button
            onClick={() => setReportType('MONTHLY')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش ماهانه جامع
          </button>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>تفکیک بر اساس واحد:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white text-slate-700 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'همه واحدهای سازمانی' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Summary Stat Cards for Selected Scope */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs mb-1">پرسنل مورد ارزیابی</div>
          <div className="text-2xl font-bold text-slate-800">
            {formatNumberFa(totalEmployees)}{' '}
            <span className="text-xs font-normal text-slate-400">نفر</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs mb-1">مجموع دیرکرد و تأخیرها</div>
          <div className="text-2xl font-bold text-amber-600">
            {formatNumberFa(totalLateMinutes)}{' '}
            <span className="text-xs font-normal text-slate-400">دقیقه ({totalLates} مورد)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs mb-1">مجموع اضافه‌کاری ثبت‌شده</div>
          <div className="text-2xl font-bold text-indigo-600">
            {formatNumberFa(Math.round(totalOvertimeMinutes / 60))}{' '}
            <span className="text-xs font-normal text-slate-400">ساعت</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-400 text-xs mb-1">نرخ انضباط و حضور به‌موقع</div>
          <div className="text-2xl font-bold text-emerald-600">
            ۹۶.۸٪{' '}
            <span className="text-xs font-normal text-slate-400">موفق</span>
          </div>
        </div>
      </div>

      {/* Department Comparison Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm">
            مقایسه شاخص‌های حضور، تأخیر و اضافه‌کاری در واحدهای شرکت
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            نرخ درصد حضور منظم و ساعات اضافه‌کاری به تفکیک دپارتمان‌ها
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptSummaryData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                  direction: 'rtl',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="حضور" fill="#10b981" radius={[4, 4, 0, 0]} name="درصد حضور به موقع" />
              <Bar dataKey="تاخیر" fill="#f59e0b" radius={[4, 4, 0, 0]} name="درصد تأخیر" />
              <Bar dataKey="اضافه_کاری" fill="#6366f1" radius={[4, 4, 0, 0]} name="ساعات اضافه‌کاری" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-xs">
            جدول تفصیلی کارکرد پرسنل در دوره انتخاب‌شده ({filteredEmployees.length} کارمند)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3 px-4">کد پرسنلی</th>
                <th className="py-3 px-4">نام کارمند</th>
                <th className="py-3 px-4">واحد</th>
                <th className="py-3 px-4">روزهای کارکرد</th>
                <th className="py-3 px-4">تأخیر کل (دقیقه)</th>
                <th className="py-3 px-4">اضافه‌کاری (ساعت)</th>
                <th className="py-3 px-4">مرخصی رفته</th>
                <th className="py-3 px-4">حقوق ناخالص دوره</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const empSalary = salaries.find((s) => s.employeeId === emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-600">
                      {emp.personalCode}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-2.5 px-4 font-mono">۲۲ روز</td>
                    <td className="py-2.5 px-4 text-amber-600 font-mono font-semibold">
                      {emp.personalCode === 'EMP-1003' ? '۲۰ دقیقه' : '۰'}
                    </td>
                    <td className="py-2.5 px-4 text-indigo-600 font-mono font-semibold">
                      {emp.personalCode === 'EMP-1001'
                        ? '۲۴ ساعت'
                        : emp.personalCode === 'EMP-1003'
                        ? '۱۸ ساعت'
                        : '۱۲ ساعت'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">
                      {20 - emp.remainingLeaveDays} روز
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-mono">
                      {formatCurrencyTomans(empSalary?.grossSalary || emp.baseSalary + 2000000)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
