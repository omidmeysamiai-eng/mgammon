import React, { useState } from 'react';
import {
  UserCheck,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  PlaneTakeoff,
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles,
  QrCode,
  MapPin,
  Eye,
  Building
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  AdvanceRequest,
  SalaryRecord,
  User
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  formatCurrencyTomans,
  formatNumberFa,
  getTodayShamsiDetailed,
  formatShamsiDate
} from '../../utils/dateUtils';
import { NavTab } from '../common/Sidebar';

interface EmployeePortalViewProps {
  currentUser: User;
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  advances: AdvanceRequest[];
  salaries: SalaryRecord[];
  onRefresh: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentUser,
  employees,
  attendance,
  leaves,
  advances,
  salaries,
  onRefresh,
  onNavigate,
}) => {
  const shamsi = getTodayShamsiDetailed();
  const currentEmployee =
    employees.find((e) => e.id === currentUser.employeeId) ||
    employees.find((e) => e.email === currentUser.email) ||
    employees[2]; // Default to Ali Karimi for employee role demo

  const todayRecord = attendance.find(
    (a) => a.employeeId === currentEmployee?.id && a.date === shamsi.dateString
  );

  const [clockActionMsg, setClockActionMsg] = useState<{
    success: boolean;
    text: string;
  } | null>(null);

  const handleQuickClockIn = () => {
    if (!currentEmployee) return;
    const res = StorageService.clockIn(currentEmployee.id, 'MANUAL');
    setClockActionMsg({ success: res.success, text: res.message });
    onRefresh();
  };

  const handleQuickClockOut = () => {
    if (!currentEmployee) return;
    const res = StorageService.clockOut(currentEmployee.id, 'MANUAL');
    setClockActionMsg({ success: res.success, text: res.message });
    onRefresh();
  };

  // My requests and salary records
  const myLeaves = leaves.filter((l) => l.employeeId === currentEmployee?.id);
  const myAdvances = advances.filter((a) => a.employeeId === currentEmployee?.id);
  const mySalaries = salaries.filter((s) => s.employeeId === currentEmployee?.id);
  const myAttendanceHistory = attendance.filter((a) => a.employeeId === currentEmployee?.id);

  return (
    <div className="space-y-6">
      {/* Employee Greeting & Info Banner */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentEmployee?.firstName?.charAt(0) || 'ک'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg lg:text-xl font-bold text-slate-800">
                پرتال شخصی {currentEmployee?.firstName} {currentEmployee?.lastName}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentEmployee?.personalCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentEmployee?.position} | {currentEmployee?.department} | مانده مرخصی سالانه:{' '}
              <span className="font-bold text-emerald-600">{currentEmployee?.remainingLeaveDays} روز</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('qr-kiosk')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>ثبت تردد با کیوسک QR شرکت</span>
          </button>
        </div>
      </div>

      {/* Quick Clock-In / Clock-Out Widget */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-indigo-300 font-medium mb-1">
              ثبت حضور و غیاب امروز ({shamsi.dayOfWeek} {shamsi.dateString})
            </div>
            <h3 className="text-xl font-bold">
              {todayRecord?.checkInTime && todayRecord?.checkOutTime
                ? 'تردد امروز شما کامل ثبت گردیده است'
                : todayRecord?.checkInTime
                ? `ورود ثبت شده در ساعت ${todayRecord.checkInTime} (در حال کار)`
                : 'شما هنوز تردد امروز خود را ثبت نکرده‌اید'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              شیفت: ۰۸:۰۰ الی ۱۷:۰۰
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleQuickClockIn}
            disabled={!!todayRecord?.checkInTime}
            className={`py-3.5 px-5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              todayRecord?.checkInTime
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>
              {todayRecord?.checkInTime
                ? `ورود در ${todayRecord.checkInTime} ثبت شد`
                : 'ثبت ورود به شرکت (Check In)'}
            </span>
          </button>

          <button
            onClick={handleQuickClockOut}
            disabled={!todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
            className={`py-3.5 px-5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              todayRecord?.checkOutTime
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : !todayRecord?.checkInTime
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>
              {todayRecord?.checkOutTime
                ? `خروج در ${todayRecord.checkOutTime} ثبت شد`
                : 'ثبت خروج از شرکت (Check Out)'}
            </span>
          </button>
        </div>

        {clockActionMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              clockActionMsg.success
                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500 text-rose-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{clockActionMsg.text}</span>
          </div>
        )}
      </div>

      {/* 3 Quick Action Shortcuts (Leaves, Advances, Payslips) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 text-sm">درخواست‌های مرخصی</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PlaneTakeoff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              شما دارای {currentEmployee?.remainingLeaveDays} روز مرخصی استحقاقی باقیمانده در سال جاری هستید.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              {myLeaves.slice(0, 2).map((l) => (
                <div key={l.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{l.startDate}</span>
                  <span
                    className={`font-semibold ${
                      l.status === 'APPROVED'
                        ? 'text-emerald-600'
                        : l.status === 'REJECTED'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {l.status === 'APPROVED' ? 'تأیید' : l.status === 'REJECTED' ? 'رد' : 'در انتظار'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('leaves')}
            className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            ثبت مرخصی جدید
          </button>
        </div>

        {/* Card 2: Advances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 text-sm">مساعده حقوق (علی‌الحساب)</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              امکان دریافت مساعده تا سقف ۳۰٪ حقوق پایه با کسر از فیش ماهانه.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              {myAdvances.slice(0, 2).map((a) => (
                <div key={a.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-mono">{formatCurrencyTomans(a.amount)}</span>
                  <span
                    className={`font-semibold ${
                      a.status === 'APPROVED'
                        ? 'text-emerald-600'
                        : a.status === 'REJECTED'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {a.status === 'APPROVED' ? 'تأیید' : a.status === 'REJECTED' ? 'رد' : 'در انتظار'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('advances')}
            className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            درخواست مساعده جدید
          </button>
        </div>

        {/* Card 3: Payslips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 text-sm">فیش‌های حقوقی</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              مشاهده احکام و فیش‌های رسمی حقوق با تفکیک مزایا، اضافه‌کاری و بیمه.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              {mySalaries.slice(0, 2).map((s) => (
                <div key={s.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-mono">{s.month}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrencyTomans(s.netSalary)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('payroll')}
            className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            مشاهده کامل فیش حقوقی
          </button>
        </div>
      </div>

      {/* Attendance History of Current Employee */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>سوابق تردد اخیر شما</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3 px-4">تاریخ</th>
                <th className="py-3 px-4">ورود</th>
                <th className="py-3 px-4">خروج</th>
                <th className="py-3 px-4">تأخیر</th>
                <th className="py-3 px-4">اضافه‌کاری</th>
                <th className="py-3 px-4">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myAttendanceHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-mono font-medium">{rec.date}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700 font-semibold">
                    {rec.checkInTime || '-'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-rose-700 font-semibold">
                    {rec.checkOutTime || (rec.checkInTime ? 'در حال کار' : '-')}
                  </td>
                  <td className="py-2.5 px-4">
                    {rec.lateMinutes > 0 ? (
                      <span className="text-rose-600 font-semibold">{rec.lateMinutes} دقیقه</span>
                    ) : (
                      <span className="text-slate-400">به‌موقع</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-indigo-600">
                    {rec.overtimeMinutes > 0 ? `+${rec.overtimeMinutes} دقیقه` : '۰'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {rec.status === 'PRESENT'
                        ? 'حاضر'
                        : rec.status === 'LATE'
                        ? 'تأخیر'
                        : rec.status === 'ON_LEAVE'
                        ? 'مرخصی'
                        : 'غیبت'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
