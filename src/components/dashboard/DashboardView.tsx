import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ClockAlert,
  PlaneTakeoff,
  Timer,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  QrCode,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  AdvanceRequest,
  SalaryRecord,
  User
} from '../../types';
import {
  formatCurrencyTomans,
  formatNumberFa,
  getTodayShamsiDetailed,
  formatShamsiDate
} from '../../utils/dateUtils';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  currentUser?: User;
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  advances: AdvanceRequest[];
  salaries: SalaryRecord[];
  onNavigate: (tab: NavTab) => void;
  onQuickClockIn?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  employees,
  attendance,
  leaves,
  advances,
  salaries,
  onNavigate,
  onQuickClockIn,
}) => {
  const shamsi = getTodayShamsiDetailed();

  // Statistics calculation for today
  const totalEmployees = employees.length;
  const todayAttendance = attendance.filter((a) => a.date === shamsi.dateString);

  const presentCount = todayAttendance.filter(
    (a) => a.status === 'PRESENT' || (a.status === 'LATE' && a.checkInTime)
  ).length;

  const lateCount = todayAttendance.filter((a) => a.status === 'LATE').length;

  const onLeaveCount = leaves.filter(
    (l) => l.status === 'APPROVED' && l.startDate <= shamsi.dateString && l.endDate >= shamsi.dateString
  ).length;

  const absentCount = Math.max(0, totalEmployees - presentCount - onLeaveCount);

  // Total overtime in hours today
  const totalOvertimeMinutes = todayAttendance.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  // Pending alerts
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');
  const pendingAdvances = advances.filter((a) => a.status === 'PENDING');
  const notCheckedOutEmployees = todayAttendance.filter(
    (a) => a.checkInTime && !a.checkOutTime
  );
  const pendingPayroll = salaries.filter((s) => s.status !== 'PAID');

  // Weekly attendance chart data (last 6 working days)
  const weeklyAttendanceData = [
    { day: 'شنبه', حاضر: 7, تاخیر: 1, غایب: 0 },
    { day: 'یکشنبه', حاضر: 8, تاخیر: 0, غایب: 0 },
    { day: 'دوشنبه', حاضر: 6, تاخیر: 2, غایب: 0 },
    { day: 'سه‌شنبه', حاضر: 7, تاخیر: 1, غایب: 0 },
    { day: 'چهارشنبه', حاضر: 8, تاخیر: 0, غایب: 0 },
    { day: 'امروز', حاضر: presentCount, تاخیر: lateCount, غایب: absentCount },
  ];

  // Monthly overtime trend (hours)
  const monthlyOvertimeData = [
    { month: 'اردیبهشت', hours: 42 },
    { month: 'خرداد', hours: 55 },
    { month: 'تیر', hours: 68 },
    { month: 'مرداد', hours: 82 },
    { month: 'شهریور', hours: 94 },
    { month: 'مهر جاری', hours: 38 },
  ];

  // Payroll distribution by workshop units (کارگاه تولید تخته‌نرد)
  const departmentCosts = [
    { name: 'کارگاه ۱: نجاری و کلاف‌سازی', value: 38000000, color: '#4f46e5' },
    { name: 'کارگاه ۱: معرق و منبت‌کاری', value: 62000000, color: '#06b6d4' },
    { name: 'کارگاه ۲: سنباده، رنگ و پلی‌استر', value: 28000000, color: '#f59e0b' },
    { name: 'کارگاه ۲: مونتاژ و یراق‌آلات', value: 26000000, color: '#10b981' },
    { name: 'انبار چوب، بسته‌بندی و سرپرستی', value: 53000000, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Greeting & Fast Actions Banner */}
      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
              سلام، {currentUser?.name?.split(' (')[0] || 'مدیر گرامی'} خوش آمدید
            </h2>
          </div>
          <p className="text-slate-500 text-xs lg:text-sm mt-1">
            امروز {shamsi.dayOfWeek}، {shamsi.day} {shamsi.monthName} {shamsi.year} | تمامی سامانه‌های حضور و غیاب و ثبت تردد برخط هستند.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('qr-kiosk')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>کیوسک QR و پایش تردد</span>
          </button>

          <button
            onClick={() => onNavigate('leaves')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>بررسی درخواست‌ها</span>
          </button>
        </div>
      </div>

      {/* 6 Key Statistical Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Employees */}
        <div
          onClick={() => onNavigate('employees')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">تعداد کل پرسنل</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {formatNumberFa(totalEmployees)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>در کارگاه‌های شماره ۱ و ۲ تخته‌نرد</span>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">کارکنان حاضر</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatNumberFa(presentCount)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <span>{Math.round((presentCount / (totalEmployees || 1)) * 100)}٪ نرخ حضور امروز</span>
          </div>
        </div>

        {/* Card 3: Absents */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">غایبین امروز</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            {formatNumberFa(absentCount)}
          </div>
          <div className="text-[11px] text-rose-500 mt-1">
            <span>عدم ثبت ورود تا اکنون</span>
          </div>
        </div>

        {/* Card 4: Lates */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">تأخیرهای امروز</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 tracking-tight">
            {formatNumberFa(lateCount)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            <span>ورود پس از شناوری ۱۵ دقیقه</span>
          </div>
        </div>

        {/* Card 5: Active Leaves */}
        <div
          onClick={() => onNavigate('leaves')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">مرخصی فعال</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlaneTakeoff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 tracking-tight">
            {formatNumberFa(onLeaveCount)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">
            <span>استحقاقی و استعلاجی مصوب</span>
          </div>
        </div>

        {/* Card 6: Overtime */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">مجموع اضافه‌کاری</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 tracking-tight">
            {formatNumberFa(Number(totalOvertimeHours))} <span className="text-xs font-normal text-slate-500">ساعت</span>
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">
            <span>ثبت شده برای شیفت‌های امروز</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Section (بخش هشدار) */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            اقدامات فوری و هشدارهای نیازمند بررسی مدیر
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Alert 1: New Requests */}
          <div
            onClick={() => onNavigate(pendingLeaves.length > 0 ? 'leaves' : 'advances')}
            className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-start justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-800">
                درخواست‌های جدید در انتظار تأیید
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {pendingLeaves.length} مرخصی و {pendingAdvances.length} درخواست مساعده در صف بررسی هستند.
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              {pendingLeaves.length + pendingAdvances.length} مورد
            </span>
          </div>

          {/* Alert 2: Missing Check-outs */}
          <div
            onClick={() => onNavigate('attendance')}
            className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-start justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-800">
                کارکنان در حال حاضر در شرکت
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {notCheckedOutEmployees.length} نفر ورود داشته و هنوز خروج روزانه را ثبت نکرده‌اند.
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              {notCheckedOutEmployees.length} حاضر
            </span>
          </div>

          {/* Alert 3: Pending Payrolls */}
          <div
            onClick={() => onNavigate('payroll')}
            className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-start justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-800">
                وضعیت تسویه حقوق و فیش‌ها
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {pendingPayroll.length} فیش در وضعیت پیش‌نویس/محاسبه‌شده برای ماه جاری آماده صدور است.
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              {pendingPayroll.length} فیش
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics / Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Weekly Attendance Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                نمودار وضعیت حضور و غیاب در طول هفته
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توزیع کارکنان حاضر، دارای تأخیر و غایب در ۶ روز کاری اخیر
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              هفته اول مهر
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                <Bar dataKey="حاضر" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="تاخیر" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="غایب" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>حاضر به موقع</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>دارای تأخیر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>غیبت غیرموجه</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Department Payroll Cost Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                توزیع هزینه دستمزد در خطوط تولید و کارگاه‌ها
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                سهم هزینه‌ای بخش‌های نجاری، معرق، رنگ و مونتاژ تخته‌نرد
              </p>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentCosts}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentCosts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrencyTomans(Number(val) || 0), 'هزینه حقوق']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    direction: 'rtl',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {departmentCosts.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{formatCurrencyTomans(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Overtime Trend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              روند مجموع ساعات اضافه‌کاری ماهانه شرکت
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              پایش بهره‌وری و اضافه کاری تیم‌ها در ۶ ماهه اول سال
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>کنترل شده و متناسب</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyOvertimeData}>
              <defs>
                <linearGradient id="overtimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} ساعت`, 'اضافه‌کاری']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                  direction: 'rtl',
                  border: 'none',
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#overtimeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
