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
  MessageSquare,
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
  | 'messages'
  | 'payroll'
  | 'reports'
  | 'employee-portal'
  | 'settings';

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
        { id: 'employee-portal' as NavTab, label: 'میز کار من', icon: UserCheck, count: 0 },
        { id: 'attendance' as NavTab, label: 'سوابق تردد و کارکرد', icon: Clock, count: 0 },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک تردد کارگاه', icon: QrCode, count: 0 },
        { id: 'leaves' as NavTab, label: 'درخواست‌های مرخصی', icon: PlaneTakeoff, count: 0 },
        { id: 'advances' as NavTab, label: 'مساعده حقوق', icon: Wallet, count: 0 },
        { id: 'payroll' as NavTab, label: 'فیش حقوقی', icon: CreditCard, count: 0 },
      ];
    }

    if (activeRole === 'MANAGER') {
      return [
        { id: 'dashboard' as NavTab, label: 'داشبورد مدیریتی', icon: LayoutDashboard, count: 0 },
        { id: 'employees' as NavTab, label: 'پرسنل کارگاه', icon: Users, count: 0 },
        { id: 'attendance' as NavTab, label: 'حضور و غیاب امروز', icon: Clock, count: 0 },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR و تردد', icon: QrCode, count: 0 },
        { id: 'messages' as NavTab, label: 'پیام‌رسانی و پیامک', icon: MessageSquare, count: 0 },
        { id: 'leaves' as NavTab, label: 'بررسی مرخصی‌ها', icon: PlaneTakeoff, count: pendingLeavesCount },
        { id: 'advances' as NavTab, label: 'بررسی مساعده‌ها', icon: Wallet, count: pendingAdvancesCount },
        { id: 'payroll' as NavTab, label: 'حقوق و دستمزد', icon: CreditCard, count: 0 },
        { id: 'reports' as NavTab, label: 'گزارش‌های عملکردی', icon: BarChart3, count: 0 },
        { id: 'employee-portal' as NavTab, label: 'نمای پرتال پرسنل', icon: UserCheck, count: 0 },
        { id: 'settings' as NavTab, label: 'تنظیمات کارگاه و شیفت', icon: Settings, count: 0 },
      ];
    }

    // ADMIN
    return [
      { id: 'dashboard' as NavTab, label: 'داشبورد مدیریت کل', icon: LayoutDashboard, count: 0 },
      { id: 'employees' as NavTab, label: 'مدیریت پرسنل', icon: Users, count: 0 },
      { id: 'attendance' as NavTab, label: 'حضور و غیاب پرسنل', icon: Clock, count: 0 },
      { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR و تردد (۲۰ متر)', icon: QrCode, count: 0 },
      { id: 'schedules' as NavTab, label: 'شیفت و تقویم کاری', icon: CalendarDays, count: 0 },
      { id: 'messages' as NavTab, label: 'پیام‌رسانی و پنل پیامک', icon: MessageSquare, count: 0 },
      { id: 'leaves' as NavTab, label: 'مدیریت مرخصی‌ها', icon: PlaneTakeoff, count: pendingLeavesCount },
      { id: 'advances' as NavTab, label: 'مساعده و علی‌الحساب', icon: Wallet, count: pendingAdvancesCount },
      { id: 'payroll' as NavTab, label: 'حقوق و دستمزد', icon: CreditCard, count: 0 },
      { id: 'reports' as NavTab, label: 'گزارش‌ها و خروجی', icon: BarChart3, count: 0 },
      { id: 'employee-portal' as NavTab, label: 'میز کار پرسنلی', icon: UserCheck, count: 0 },
      { id: 'settings' as NavTab, label: 'تنظیمات کارگاه‌ها', icon: Settings, count: 0 },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            منوی سامانه ({activeRole === 'ADMIN' ? 'مدیریت ارشد' : activeRole === 'MANAGER' ? 'مدیریت منابع انسانی' : 'میز کار پرسنلی'})
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

      {/* Footer Branding in Sidebar */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
          <div className="text-[11px] text-slate-600 font-semibold">
            M.GOMMON | مجید نورایی
          </div>
          <a
            href="https://ahourai.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-indigo-600 block mt-1 font-medium transition-colors"
          >
            طراحی و توسعه توسط اهورایی ❤️
          </a>
        </div>
      </div>
    </aside>
  );
};
