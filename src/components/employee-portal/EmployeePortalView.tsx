import React, { useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  PlaneTakeoff,
  Wallet,
  CreditCard,
  CheckCircle,
  QrCode,
  MapPin,
  Building,
  Camera,
  Bell,
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  AdvanceRequest,
  SalaryRecord,
  User,
  BroadcastMessage
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  formatCurrencyTomans,
  formatNumberFa,
  getTodayShamsiDetailed,
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

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentEmployee?.avatarUrl || null
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        if (currentEmployee) {
          const updated = { ...currentEmployee, avatarUrl: base64 };
          StorageService.updateEmployee(updated);
          onRefresh();
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  // My requests, salary records and relevant messages
  const myLeaves = leaves.filter((l) => l.employeeId === currentEmployee?.id);
  const myAdvances = advances.filter((a) => a.employeeId === currentEmployee?.id);
  const mySalaries = salaries.filter((s) => s.employeeId === currentEmployee?.id);
  const myAttendanceHistory = attendance.filter((a) => a.employeeId === currentEmployee?.id);

  // Workshop messages
  const allMessages = StorageService.getMessages();
  const myMessages = allMessages.filter(
    (m) =>
      m.recipientType === 'ALL' ||
      (m.recipientType === 'WORKSHOP_1' && (!currentEmployee?.workshopId || currentEmployee?.workshopId === 'ws_1')) ||
      (m.recipientType === 'WORKSHOP_2' && currentEmployee?.workshopId === 'ws_2') ||
      (m.recipientIds && currentEmployee && m.recipientIds.includes(currentEmployee.id))
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Employee Clean Profile Banner */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar with photo upload */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={currentEmployee?.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentEmployee?.firstName?.charAt(0) || 'ک'}</span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -left-1 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-600 transition-colors"
              title="بارگذاری یا تغییر عکس پرسنلی"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg lg:text-xl font-bold text-slate-800">
                {currentEmployee?.firstName} {currentEmployee?.lastName}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                کد پرسنلی: {currentEmployee?.personalCode}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentEmployee?.workshopId === 'ws_2' ? 'کارگاه ۲ (انبار و مونتاژ)' : 'کارگاه ۱ (اصلی - تولید)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              سمت: <strong>{currentEmployee?.position}</strong> | واحد: <strong>{currentEmployee?.department}</strong> | مانده مرخصی سالانه:{' '}
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
            <span>ثبت با کیوسک QR کارگاه</span>
          </button>
        </div>
      </div>

      {/* Quick Clock-In / Clock-Out Widget */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-indigo-300 font-medium mb-1">
              تردد امروز ({shamsi.dayOfWeek} {shamsi.dateString})
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
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
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              محدوده مجاز ۲۰ متر
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
                : 'ثبت ورود به کارگاه'}
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
                : 'ثبت خروج از کارگاه'}
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

      {/* Workshop Announcements / Messages for Employee */}
      {myMessages.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>آخرین اطلاعیه‌ها و پیام‌های ارسالی مدیریت کارگاه</span>
            </h4>
            <span className="text-[11px] text-amber-700 font-mono">
              {formatNumberFa(myMessages.length)} پیام
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myMessages.slice(0, 2).map((msg) => (
              <div
                key={msg.id}
                className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{msg.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.sentAt.split(' - ')[0]}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Attendance History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>سوابق تردد اخیر شما</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {myAttendanceHistory.length} رکورد
          </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {myAttendanceHistory.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              سابقه‌ای برای نمایش وجود ندارد.
            </div>
          ) : (
            myAttendanceHistory.map((rec) => (
              <div key={rec.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">{rec.date}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                    {rec.status === 'PRESENT'
                      ? 'حاضر'
                      : rec.status === 'LATE'
                      ? 'تأخیر'
                      : rec.status === 'ON_LEAVE'
                      ? 'مرخصی'
                      : 'غیبت'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ساعت ورود:</span>
                    <span className="font-semibold text-emerald-700">{rec.checkInTime || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ساعت خروج:</span>
                    <span className="font-semibold text-rose-700">
                      {rec.checkOutTime || (rec.checkInTime ? 'در حال کار' : '-')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">تأخیر:</span>
                    <span className={rec.lateMinutes > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes} دقیقه` : 'به‌موقع'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">اضافه‌کاری:</span>
                    <span className="text-indigo-600 font-semibold">
                      {rec.overtimeMinutes > 0 ? `+${rec.overtimeMinutes} د` : '۰'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
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
