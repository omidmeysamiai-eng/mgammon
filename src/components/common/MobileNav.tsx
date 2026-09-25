import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  QrCode,
  PlaneTakeoff,
  Wallet,
  CreditCard,
  BarChart3,
  CalendarDays,
  Settings,
  UserCheck,
  MessageSquare,
  Menu,
  X,
  ChevronLeft,
  Building2,
  Shield,
  Briefcase
} from 'lucide-react';
import { Role, User } from '../../types';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role?: Role;
  currentRole?: Role;
  currentUser?: User;
  isOpen: boolean;
  onClose: () => void;
  pendingLeavesCount: number;
  pendingAdvancesCount: number;
  onQuickClockIn?: () => void;
  onQuickClockOut?: () => void;
  isClockedIn?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  role,
  currentRole,
  currentUser,
  isOpen,
  onClose,
  pendingLeavesCount,
  pendingAdvancesCount,
}) => {
  const activeRole = currentRole || role || currentUser?.role || 'ADMIN';
  const totalPending = pendingLeavesCount + pendingAdvancesCount;

  // Primary 5 tabs for the Bottom Bar
  const getBottomNavItems = () => {
    if (activeRole === 'EMPLOYEE') {
      return [
        { id: 'employee-portal' as NavTab, label: 'میز کار', icon: UserCheck },
        { id: 'attendance' as NavTab, label: 'تردد', icon: Clock },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR', icon: QrCode },
        { id: 'leaves' as NavTab, label: 'مرخصی', icon: PlaneTakeoff },
        { id: 'payroll' as NavTab, label: 'فیش حقوق', icon: CreditCard },
      ];
    }

    if (activeRole === 'MANAGER') {
      return [
        { id: 'dashboard' as NavTab, label: 'داشبورد', icon: LayoutDashboard },
        { id: 'employees' as NavTab, label: 'پرسنل', icon: Users },
        { id: 'attendance' as NavTab, label: 'تردد', icon: Clock },
        { id: 'messages' as NavTab, label: 'پیامک', icon: MessageSquare },
        { id: 'leaves' as NavTab, label: 'درخواست‌ها', icon: PlaneTakeoff, badge: totalPending },
      ];
    }

    // ADMIN
    return [
      { id: 'dashboard' as NavTab, label: 'داشبورد', icon: LayoutDashboard },
      { id: 'employees' as NavTab, label: 'پرسنل', icon: Users },
      { id: 'attendance' as NavTab, label: 'تردد', icon: Clock },
      { id: 'qr-kiosk' as NavTab, label: 'کیوسک', icon: QrCode },
      { id: 'messages' as NavTab, label: 'پیامک', icon: MessageSquare },
    ];
  };

  // Full item list for Drawer
  const getAllNavItems = () => {
    if (activeRole === 'EMPLOYEE') {
      return [
        { id: 'employee-portal' as NavTab, label: 'میز کار کارمندی', icon: UserCheck, category: 'اصلی' },
        { id: 'attendance' as NavTab, label: 'سوابق تردد و کارکرد', icon: Clock, category: 'اصلی' },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک ثبت با QR و موقعیت ۲۰ متر', icon: QrCode, category: 'ابزارها' },
        { id: 'leaves' as NavTab, label: 'درخواست‌های مرخصی', icon: PlaneTakeoff, category: 'درخواست‌ها' },
        { id: 'advances' as NavTab, label: 'درخواست مساعده حقوق', icon: Wallet, category: 'درخواست‌ها' },
        { id: 'payroll' as NavTab, label: 'فیش‌های حقوقی من', icon: CreditCard, category: 'مالی' },
      ];
    }

    if (activeRole === 'MANAGER') {
      return [
        { id: 'dashboard' as NavTab, label: 'داشبورد مدیریتی', icon: LayoutDashboard, category: 'اصلی' },
        { id: 'employees' as NavTab, label: 'پرسنل تحت مدیریت', icon: Users, category: 'اصلی' },
        { id: 'attendance' as NavTab, label: 'حضور و غیاب امروز', icon: Clock, category: 'اصلی' },
        { id: 'qr-kiosk' as NavTab, label: 'کیوسک حضور و QR', icon: QrCode, category: 'ابزارها' },
        { id: 'messages' as NavTab, label: 'پیام‌رسانی و پنل پیامک', icon: MessageSquare, category: 'ارتباطات' },
        { id: 'leaves' as NavTab, label: 'بررسی مرخصی‌ها', icon: PlaneTakeoff, badge: pendingLeavesCount, category: 'درخواست‌ها' },
        { id: 'advances' as NavTab, label: 'بررسی مساعده‌ها', icon: Wallet, badge: pendingAdvancesCount, category: 'درخواست‌ها' },
        { id: 'payroll' as NavTab, label: 'حقوق و دستمزد', icon: CreditCard, category: 'مالی' },
        { id: 'reports' as NavTab, label: 'گزارش‌های عملکردی', icon: BarChart3, category: 'گزارشات' },
        { id: 'employee-portal' as NavTab, label: 'نمای پرتال پرسنل', icon: UserCheck, category: 'پرتال' },
        { id: 'settings' as NavTab, label: 'تنظیمات کارگاه و شیفت', icon: Settings, category: 'تنظیمات' },
      ];
    }

    // ADMIN
    return [
      { id: 'dashboard' as NavTab, label: 'داشبورد مدیریت کل', icon: LayoutDashboard, category: 'اصلی' },
      { id: 'employees' as NavTab, label: 'مدیریت اطلاعات پرسنل', icon: Users, category: 'اصلی' },
      { id: 'attendance' as NavTab, label: 'حضور و غیاب پرسنل', icon: Clock, category: 'اصلی' },
      { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR داینامیک و GPS', icon: QrCode, category: 'تردد هوشمند' },
      { id: 'schedules' as NavTab, label: 'شیفت و تقوim کاری', icon: CalendarDays, category: 'برنامه‌ریزی' },
      { id: 'messages' as NavTab, label: 'پیام‌رسانی و پنل پیامک', icon: MessageSquare, category: 'ارتباطات' },
      { id: 'leaves' as NavTab, label: 'مدیریت مرخصی‌ها', icon: PlaneTakeoff, badge: pendingLeavesCount, category: 'درخواست‌ها' },
      { id: 'advances' as NavTab, label: 'مساعده و علی‌الحساب', icon: Wallet, badge: pendingAdvancesCount, category: 'درخواست‌ها' },
      { id: 'payroll' as NavTab, label: 'حقوق و دستمزد و فیش‌ها', icon: CreditCard, category: 'مالی' },
      { id: 'reports' as NavTab, label: 'گزارش‌ها و نمودارها', icon: BarChart3, category: 'گزارشات' },
      { id: 'employee-portal' as NavTab, label: 'میز کار پرسنلی', icon: UserCheck, category: 'پرتال' },
      { id: 'settings' as NavTab, label: 'تنظیمات کارگاه‌ها و سیستم', icon: Settings, category: 'مدیریت' },
    ];
  };

  const bottomItems = getBottomNavItems();
  const drawerItems = getAllNavItems();

  return (
    <>
      {/* 1. STICKY MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around max-w-full overflow-hidden">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative min-w-[56px] ${
                isActive
                  ? 'text-indigo-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 stroke-[2.2]' : 'text-slate-400'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-indigo-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-mobile-drawer'));
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer min-w-[56px]"
          title="سایر بخش‌های سامانه"
        >
          <Menu className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] mt-1 text-slate-500">منو</span>
        </button>
      </nav>

      {/* 2. SLIDE-OVER MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-800">
                    M.GOMMON | مجید نورایی
                  </h3>
                  <p className="text-[10px] text-slate-400">سامانه مدیریت کارگاهی</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User info in Drawer */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {currentUser?.name || 'کاربر سیستم'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentUser?.role === 'ADMIN'
                    ? 'مدیر ارشد'
                    : currentUser?.role === 'MANAGER'
                    ? 'مدیر منابع انسانی'
                    : 'پرسنل کارگاه'}
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 font-medium">حساب فعال</span>
            </div>

            {/* Navigation Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-right transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Branding in Drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <a
                href="https://ahourai.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors inline-block"
              >
                طراحی و توسعه توسط اهورایی ❤️
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
