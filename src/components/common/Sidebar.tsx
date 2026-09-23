import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  QrCode,
  CalendarDays,
  PlaneTakeoff,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  FileCode2,
  ChevronLeft
} from 'lucide-react';
import { Role } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'qr-kiosk'
  | 'schedules'
  | 'leaves'
  | 'advances'
  | 'payroll'
  | 'reports'
  | 'employee-portal'
  | 'settings'
  | 'docs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role?: Role;
  currentRole?: Role;
  pendingLeavesCount: number;
  pendingAdvancesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
  currentRole,
  pendingLeavesCount,
  pendingAdvancesCount,
}) => {
  const activeRole = currentRole || role || 'ADMIN';
  const getNavItems = () => {
    if (activeRole === 'EMPLOYEE') {
      return [
        { id: 'employee-portal' as NavTab, label: 'پرتال اختصاصی من', icon: UserCheck, count: 0 },
        { id: 'attendance' as NavTab, label: 'سوابق تردد و کارکرد', icon: Clock, count: 0 },
        { id: 'leaves' as NavTab, label: 'درخواست‌های مرخصی', icon: PlaneTakeoff, count: 0 },
        { id: 'advances' as NavTab, label: 'درخواست مساعده حقوق', icon: Wallet, count: 0 },
        { id: 'payroll' as NavTab, label: 'فیش‌های حقوقی من', icon: CreditCard, count: 0 },
        { id: 'qr-kiosk' as NavTab, label: 'ثبت با QR و GPS', icon: QrCode, count: 0 },
        { id: 'docs' as NavTab, label: 'مستندات معماری و API', icon: FileCode2, count: 0 },
      ];
    }

    if (activeRole === 'MANAGER') {
      return [
        { id: 'dashboard' as NavTab, label: 'داشبورد مدیریتی', icon: LayoutDashboard, count: 0 },
        { id: 'employees' as NavTab, label: 'پرسنل تحت مدیریت', icon: Users, count: 0 },
        { id: 'attendance' as NavTab, label: 'حضور و غیاب امروز', icon: Clock, count: 0 },
        { id: 'leaves' as NavTab, label: 'بررسی مرخصی‌ها', icon: PlaneTakeoff, count: pendingLeavesCount },
        { id: 'advances' as NavTab, label: 'بررسی مساعده‌ها', icon: Wallet, count: pendingAdvancesCount },
        { id: 'reports' as NavTab, label: 'گزارش‌های عملکردی', icon: BarChart3, count: 0 },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک حضور و QR', icon: QrCode, count: 0 },
        { id: 'employee-portal' as NavTab, label: 'نمای پرتال پرسنل', icon: UserCheck, count: 0 },
        { id: 'docs' as NavTab, label: 'مستندات معماری و API', icon: FileCode2, count: 0 },
      ];
    }

    // ADMIN
    return [
      { id: 'dashboard' as NavTab, label: 'داشبورد مدیریت', icon: LayoutDashboard, count: 0 },
      { id: 'employees' as NavTab, label: 'مدیریت کارکنان', icon: Users, count: 0 },
      { id: 'attendance' as NavTab, label: 'حضور و غیاب', icon: Clock, count: 0 },
      { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR داینامیک و GPS', icon: QrCode, count: 0 },
      { id: 'schedules' as NavTab, label: 'شیفت و تقویم کاری', icon: CalendarDays, count: 0 },
      { id: 'leaves' as NavTab, label: 'مدیریت مرخصی‌ها', icon: PlaneTakeoff, count: pendingLeavesCount },
      { id: 'advances' as NavTab, label: 'مساعده و علی‌الحساب', icon: Wallet, count: pendingAdvancesCount },
      { id: 'payroll' as NavTab, label: 'حقوق و دستمزد', icon: CreditCard, count: 0 },
      { id: 'reports' as NavTab, label: 'گزارش‌ها و خروجی', icon: BarChart3, count: 0 },
      { id: 'employee-portal' as NavTab, label: 'پرتال اختصاصی کارمند', icon: UserCheck, count: 0 },
      { id: 'settings' as NavTab, label: 'تنظیمات و Audit Logs', icon: Settings, count: 0 },
      { id: 'docs' as NavTab, label: 'معماری، دیتابیس و API', icon: FileCode2, count: 0 },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            منوی سامانه ({role === 'ADMIN' ? 'مدیریت کل' : role === 'MANAGER' ? 'مدیریت واحد' : 'پرتال پرسنلی'})
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {item.count}
                  </span>
                ) : isActive ? (
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status info box at bottom of sidebar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-500 text-[11px] mt-6">
        <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
          <span>وضعیت سرور و پایگاه</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            فعال
          </span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          نسخه ۱.۰.۰ | هماهنگ با تقویم خورشیدی و قوانین اداره کار
        </p>
      </div>
    </aside>
  );
};
