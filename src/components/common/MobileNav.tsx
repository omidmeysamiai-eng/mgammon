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
  FileCode2,
  Menu,
  X
} from 'lucide-react';
import { Role } from '../../types';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role?: Role;
  currentRole?: Role;
  isOpen?: boolean;
  onClose?: () => void;
  pendingLeavesCount: number;
  pendingAdvancesCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  role,
  currentRole,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  pendingLeavesCount,
  pendingAdvancesCount,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (externalOnClose && !open) {
      externalOnClose();
    }
    setInternalIsOpen(open);
  };

  const activeRole = currentRole || role || 'ADMIN';

  const getNavItems = () => {
    if (activeRole === 'EMPLOYEE') {
      return [
        { id: 'employee-portal' as NavTab, label: 'پرتال اختصاصی من', icon: UserCheck },
        { id: 'attendance' as NavTab, label: 'سوابق تردد و کارکرد', icon: Clock },
        { id: 'leaves' as NavTab, label: 'درخواست مرخصی', icon: PlaneTakeoff },
        { id: 'advances' as NavTab, label: 'درخواست مساعده', icon: Wallet },
        { id: 'payroll' as NavTab, label: 'فیش‌های حقوقی من', icon: CreditCard },
        { id: 'qr-kiosk' as NavTab, label: 'ثبت با QR و GPS', icon: QrCode },
        { id: 'docs' as NavTab, label: 'مستندات معماری و API', icon: FileCode2 },
      ];
    }

    return [
      { id: 'dashboard' as NavTab, label: 'داشبورد', icon: LayoutDashboard },
      { id: 'employees' as NavTab, label: 'پرسنل', icon: Users },
      { id: 'attendance' as NavTab, label: 'حضور و غیاب', icon: Clock },
      { id: 'qr-kiosk' as NavTab, label: 'کیوسک QR و GPS', icon: QrCode },
      { id: 'schedules' as NavTab, label: 'شیفت و تقویم', icon: CalendarDays },
      { id: 'leaves' as NavTab, label: 'مرخصی‌ها', icon: PlaneTakeoff, badge: pendingLeavesCount },
      { id: 'advances' as NavTab, label: 'مساعده‌ها', icon: Wallet, badge: pendingAdvancesCount },
      { id: 'payroll' as NavTab, label: 'حقوق و دستمزد', icon: CreditCard },
      { id: 'reports' as NavTab, label: 'گزارش‌ها', icon: BarChart3 },
      { id: 'employee-portal' as NavTab, label: 'پرتال کارمند', icon: UserCheck },
      { id: 'settings' as NavTab, label: 'تنظیمات و لاگ', icon: Settings },
      { id: 'docs' as NavTab, label: 'مستندات فنی', icon: FileCode2 },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden">
      {/* Top Mobile Bar toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>منوی بخش‌ها</span>
        </button>
        <span className="text-xs text-indigo-300 font-medium">
          {navItems.find((n) => n.id === activeTab)?.label}
        </span>
      </div>

      {isOpen && (
        <div className="bg-white border-b border-slate-200 shadow-md p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-right ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
