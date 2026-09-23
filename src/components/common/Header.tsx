import React from 'react';
import {
  Bell,
  Clock,
  Calendar,
  UserCheck,
  Shield,
  Briefcase,
  ChevronDown,
  RotateCcw,
  Building2,
  ExternalLink,
  Menu
} from 'lucide-react';
import { User, Role } from '../../types';
import { getTodayShamsiDetailed } from '../../utils/dateUtils';
import { StorageService } from '../../services/storage';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenDocs?: () => void;
  onResetData?: () => void;
  pendingRequestsCount: number;
  onNavigateToRequests?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  onOpenDocs,
  onResetData,
  pendingRequestsCount,
  onNavigateToRequests,
  onToggleMobileMenu,
}) => {
  const shamsi = getTodayShamsiDetailed();
  const [timeStr, setTimeStr] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const users = StorageService.getUsers();
  const settings = StorageService.getSettings();

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3" /> مدیر کل (ADMIN)
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Briefcase className="w-3 h-3" /> مدیر واحد (MANAGER)
          </span>
        );
      case 'EMPLOYEE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" /> پرسنل (EMPLOYEE)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Company name & live date */}
        <div className="flex items-center gap-4">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="منوی ناوبری"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-800 text-base lg:text-lg tracking-tight">
                  {settings.companyName}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  {settings.companyCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">
                سامانه یکپارچه مدیریت سرمایه انسانی، تردد هوشمند و حقوق و دستمزد
              </p>
            </div>
          </div>
        </div>

        {/* Center / Shamsi Date and Live Clock */}
        <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {shamsi.dayOfWeek} {shamsi.day} {shamsi.monthName} {shamsi.year}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Right Side: Docs, Notifications, Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Documentation Button */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            title="مستندات معماری، ساختار دیتابیس و API"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">معماری و دیتابیس</span>
          </button>

          {/* Pending Alerts / Notifications */}
          <button
            onClick={onNavigateToRequests}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="درخواست‌های در انتظار بررسی"
          >
            <Bell className="w-4 h-4" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="بازنشانی داده‌های نمونه اولیه"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Switch User / Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                  {currentUser.name.split(' (')[0]}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {currentUser.role === 'ADMIN' ? 'مدیر ارشد' : currentUser.role === 'MANAGER' ? 'مدیر واحد' : 'پرسنل عادی'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800">تغییر کاربر و نقش فعال (تست زنده)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    با یک کلیک سامانه را از دید مدیر یا کارمند تجربه کنید.
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => onUserChange(u)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-right transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 text-indigo-950 font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs text-slate-800 font-medium">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <div>{getRoleBadge(u.role)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
