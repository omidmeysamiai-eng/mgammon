import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { EmployeesView } from './components/employees/EmployeesView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { SchedulesView } from './components/schedules/SchedulesView';
import { DynamicQrKioskView } from './components/qr-kiosk/DynamicQrKioskView';
import { LeavesView } from './components/leaves/LeavesView';
import { AdvancesView } from './components/advances/AdvancesView';
import { PayrollView } from './components/payroll/PayrollView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { EmployeePortalView } from './components/employee-portal/EmployeePortalView';
import { ArchitectureDocsView } from './components/docs/ArchitectureDocsView';

// Service & Types
import { StorageService } from './services/storage';
import {
  Employee,
  AttendanceRecord,
  Shift,
  LeaveRequest,
  AdvanceRequest,
  SalaryRecord,
  CompanySettings,
  AuditLog,
  User
} from './types';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(() => StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load / refresh data from StorageService
  const loadData = () => {
    setEmployees(StorageService.getEmployees());
    setAttendance(StorageService.getAttendance());
    setShifts(StorageService.getShifts());
    setLeaves(StorageService.getLeaves());
    setAdvances(StorageService.getAdvances());
    setSalaries(StorageService.getSalaries());
    setSettings(StorageService.getSettings());
    setAuditLogs(StorageService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle switching user role
  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    if (user.role === 'EMPLOYEE') {
      setActiveTab('employee-portal');
    } else if (activeTab === 'employee-portal') {
      setActiveTab('dashboard');
    }
  };

  const handleResetData = () => {
    if (confirm('آیا از بازنشانی داده‌های نمونه اولیه اطمینان دارید؟ کلیه تغییرات به حالت پیش‌فرض بازخواهد گشت.')) {
      StorageService.resetToDefaults();
      loadData();
      alert('داده‌های نمونه اولیه با موفقیت بازنشانی شدند.');
    }
  };

  // Pending counts for badges
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;
  const pendingAdvances = advances.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenDocs={() => setActiveTab('docs')}
        onResetData={handleResetData}
        onNavigateToRequests={() => setActiveTab('leaves')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        pendingRequestsCount={pendingLeaves + pendingAdvances}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingLeavesCount={pendingLeaves}
          pendingAdvancesCount={pendingAdvances}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingLeavesCount={pendingLeaves}
          pendingAdvancesCount={pendingAdvances}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 min-w-0 transition-all duration-200">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              employees={employees}
              attendance={attendance}
              leaves={leaves}
              advances={advances}
              salaries={salaries}
              onNavigate={setActiveTab}
              onQuickClockIn={() => {
                if (currentUser.employeeId) {
                  StorageService.clockIn(currentUser.employeeId, 'MANUAL');
                  loadData();
                }
              }}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              shifts={shifts}
              onRefresh={loadData}
              canEdit={currentUser.role === 'ADMIN'}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendance={attendance}
              employees={employees}
              shifts={shifts}
              onRefresh={loadData}
              canManage={currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'}
            />
          )}

          {activeTab === 'schedules' && (
            <SchedulesView
              shifts={shifts}
              onRefresh={loadData}
              canEdit={currentUser.role === 'ADMIN'}
            />
          )}

          {activeTab === 'qr-kiosk' && (
            <DynamicQrKioskView
              employees={employees}
              attendance={attendance}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'leaves' && (
            <LeavesView
              leaves={leaves}
              employees={employees}
              currentUser={currentUser}
              onRefresh={loadData}
              canApprove={currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'}
            />
          )}

          {activeTab === 'advances' && (
            <AdvancesView
              advances={advances}
              employees={employees}
              currentUser={currentUser}
              onRefresh={loadData}
              canApprove={currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              salaries={salaries}
              employees={employees}
              currentUser={currentUser}
              onRefresh={loadData}
              canManage={currentUser.role === 'ADMIN'}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              employees={employees}
              attendance={attendance}
              salaries={salaries}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              auditLogs={auditLogs}
              onRefresh={loadData}
              canEdit={currentUser.role === 'ADMIN'}
            />
          )}

          {activeTab === 'employee-portal' && (
            <EmployeePortalView
              currentUser={currentUser}
              employees={employees}
              attendance={attendance}
              leaves={leaves}
              advances={advances}
              salaries={salaries}
              onRefresh={loadData}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'docs' && (
            <ArchitectureDocsView />
          )}
        </main>
      </div>
    </div>
  );
}
