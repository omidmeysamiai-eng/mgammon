import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  Clock,
  PlaneTakeoff,
  X
} from 'lucide-react';
import { Employee, Shift, AttendanceRecord, SalaryRecord } from '../../types';
import {
  formatCurrencyTomans,
  formatNumberFa,
  formatShamsiDate,
  getTodayShamsi
} from '../../utils/dateUtils';
import { StorageService } from '../../services/storage';

interface EmployeesViewProps {
  employees: Employee[];
  shifts: Shift[];
  onRefresh: () => void;
  canEdit: boolean;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  shifts,
  onRefresh,
  canEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Employee | null>(null);

  // Form State
  const defaultFormData: Omit<Employee, 'id' | 'companyId'> = {
    personalCode: `EMP-${1000 + employees.length + 1}`,
    firstName: '',
    lastName: '',
    nationalCode: '',
    phone: '',
    email: '',
    department: 'تولید و ساخت',
    position: '',
    workshopId: 'ws_1',
    username: '',
    password: '123',
    hireDate: getTodayShamsi(),
    status: 'ACTIVE',
    shiftId: shifts[0]?.id || '',
    baseSalary: 25000000,
    hourlyRate: 142000,
    overtimeRate: 1.4,
    remainingLeaveDays: 20,
    bankAccount: '',
    shebaNumber: '',
  };

  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'companyId'>>(defaultFormData);

  // Unique departments for filter
  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.personalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      ...defaultFormData,
      personalCode: `EMP-${1000 + employees.length + 1}`,
      shiftId: shifts[0]?.id || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      personalCode: emp.personalCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      nationalCode: emp.nationalCode,
      phone: emp.phone,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      workshopId: emp.workshopId || 'ws_1',
      username: emp.username || '',
      password: emp.password || '123',
      hireDate: emp.hireDate,
      status: emp.status,
      shiftId: emp.shiftId,
      baseSalary: emp.baseSalary,
      hourlyRate: emp.hourlyRate,
      overtimeRate: emp.overtimeRate,
      remainingLeaveDays: emp.remainingLeaveDays,
      bankAccount: emp.bankAccount || '',
      shebaNumber: emp.shebaNumber || '',
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`آیا از حذف پرونده ${name} اطمینان دارید؟`)) {
      StorageService.deleteEmployee(id);
      onRefresh();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('لطفاً نام، نام خانوادگی و شماره موبایل را وارد نمایید.');
      return;
    }

    const settings = StorageService.getSettings();

    if (editingEmployee) {
      const updated: Employee = {
        ...formData,
        id: editingEmployee.id,
        companyId: editingEmployee.companyId,
      };
      StorageService.updateEmployee(updated);
    } else {
      const newEmp: Employee = {
        ...formData,
        id: `emp_${Date.now()}`,
        companyId: settings.id,
      };
      StorageService.addEmployee(newEmp);
    }

    setIsFormModalOpen(false);
    onRefresh();
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> فعال
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3" /> غیرفعال
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> در مرخصی
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>مدیریت اطلاعات و پرونده پرسنل</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تعریف، ویرایش و مشاهده سوابق، احکام حقوقی و وضعیت کاری {employees.length} کارمند شرکت
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>ثبت کارمند جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد پرسنلی، سمت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 py-1.5 px-2 bg-white text-slate-700 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'همه واحدها' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 py-1.5 px-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="INACTIVE">غیرفعال</option>
            <option value="ON_LEAVE">در مرخصی</option>
          </select>
        </div>
      </div>

      {/* Employees Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredEmployees.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              هیچ کارمندی با مشخصات وارد شده یافت نشد.
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const shift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];
              return (
                <div key={emp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {emp.firstName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {emp.position} <span className="text-slate-300">|</span> {emp.department}
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(emp.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">کد پرسنلی:</span>
                      <span className="font-mono font-medium text-slate-700">{emp.personalCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">حقوق پایه:</span>
                      <span className="font-semibold text-slate-800">{formatCurrencyTomans(emp.baseSalary)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">شیفت:</span>
                      <span className="text-slate-700">{shift?.name || 'شیفت عادی'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">تماس:</span>
                      <a href={`tel:${emp.phone}`} className="text-indigo-600 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{emp.phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setViewingProfile(emp)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>مشاهده پرونده کامل</span>
                    </button>

                    {canEdit && (
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                          className="p-1.5 rounded-lg text-slate-400 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">پرسنل</th>
                <th className="py-3.5 px-4">کد پرسنلی</th>
                <th className="py-3.5 px-4">واحد سازمانی / سمت</th>
                <th className="py-3.5 px-4">تاریخ استخدام</th>
                <th className="py-3.5 px-4">حقوق پایه</th>
                <th className="py-3.5 px-4">شیفت کاری</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    هیچ کارمندی با مشخصات وارد شده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const shift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{emp.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {emp.personalCode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{emp.position}</div>
                        <div className="text-[11px] text-slate-400">{emp.department}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{emp.hireDate}</td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatCurrencyTomans(emp.baseSalary)}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {shift?.name || 'شیفت عادی'}
                        </span>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Dedicated Profile */}
                          <button
                            onClick={() => setViewingProfile(emp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="مشاهده پروفایل اختصاصی"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <>
                              {/* Edit Employee */}
                              <button
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                title="ویرایش اطلاعات"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete Employee */}
                              <button
                                onClick={() =>
                                  handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="حذف پرونده"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED EMPLOYEE PROFILE MODAL (پروفایل اختصاصی کارمند) */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setViewingProfile(null)}
                className="absolute left-4 top-4 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  {viewingProfile.firstName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">
                      {viewingProfile.firstName} {viewingProfile.lastName}
                    </h3>
                    {getStatusBadge(viewingProfile.status)}
                  </div>
                  <p className="text-slate-300 text-sm mt-0.5">
                    {viewingProfile.position} | {viewingProfile.department}
                  </p>
                  <p className="text-xs text-indigo-300 font-mono mt-1">
                    کد پرسنلی: {viewingProfile.personalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">کد ملی</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {viewingProfile.nationalCode || 'ثبت نشده'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">شماره تماس</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {viewingProfile.phone}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">ایمیل سازمانی</span>
                  <span className="font-semibold text-slate-800 font-mono truncate block">
                    {viewingProfile.email || 'ندارد'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">تاریخ استخدام</span>
                  <span className="font-semibold text-slate-800">
                    {viewingProfile.hireDate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">مانده مرخصی استحقاقی</span>
                  <span className="font-semibold text-emerald-600">
                    {viewingProfile.remainingLeaveDays} روز
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">شیفت تخصیص یافته</span>
                  <span className="font-semibold text-slate-800">
                    {shifts.find((s) => s.id === viewingProfile.shiftId)?.name || 'شیفت عادی'}
                  </span>
                </div>
              </div>

              {/* Financial & Contract Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>اطلاعات مالی، حقوق و حساب بانکی</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">حقوق پایه ماهیانه:</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrencyTomans(viewingProfile.baseSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">نرخ پایه هر ساعت کار:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrencyTomans(viewingProfile.hourlyRate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">ضریب اضافه‌کاری:</span>
                    <span className="font-semibold text-indigo-600 font-mono">
                      {viewingProfile.overtimeRate} برابر
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">شماره کارت / حساب:</span>
                    <span className="font-mono text-slate-700">
                      {viewingProfile.bankAccount || 'ثبت نشده'}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex justify-between py-1.5">
                    <span className="text-slate-500">شماره شبا (IBAN):</span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {viewingProfile.shebaNumber || 'ثبت نشده'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setViewingProfile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  بستن پرونده
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>{editingEmployee ? 'ویرایش پرونده کارمند' : 'افزودن کارمند جدید'}</span>
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    نام <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: علیرضا"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: صادقی"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    کد پرسنلی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personalCode}
                    onChange={(e) => setFormData({ ...formData, personalCode: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    شماره موبایل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="۰۹۱۲XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    واحد سازمانی (Department)
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="فناوری و مهندسی">فناوری و مهندسی</option>
                    <option value="طراحی محصول">طراحی محصول</option>
                    <option value="منابع انسانی">منابع انسانی</option>
                    <option value="مالی و حسابداری">مالی و حسابداری</option>
                    <option value="پشتیبانی و عملیات">پشتیبانی و عملیات</option>
                    <option value="مارکتینگ و فروش">مارکتینگ و فروش</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    عنوان سمت شغلی
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: توسعه‌دهنده فرانت‌اند"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    شیفت کاری
                  </label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} الی {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">وضعیت فعالیت</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="ACTIVE">فعال</option>
                    <option value="INACTIVE">غیرفعال</option>
                    <option value="ON_LEAVE">در مرخصی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    کارگاه محل خدمت <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.workshopId}
                    onChange={(e) => setFormData({ ...formData, workshopId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="ws_1">کارگاه ۱ (اصلی - تولید و ساخت)</option>
                    <option value="ws_2">کارگاه ۲ (فرعی - انبار و مونتاژ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    کد ملی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationalCode}
                    onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="۰۰XXXXXXXX"
                  />
                </div>
              </div>

              {/* Portal Login Credentials Section */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-3">
                <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                  <span>اطلاعات پرتال و دسترسی کاربری کارمند</span>
                  <span className="text-[10px] text-indigo-700 font-normal">ایجاد همزمان نام کاربری و رمز</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      نام کاربری (Username)
                    </label>
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white font-mono focus:outline-none focus:border-indigo-600"
                      placeholder="مثال: ali.karimi"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      کلمه عبور ورود (Password)
                    </label>
                    <input
                      type="text"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white font-mono focus:outline-none focus:border-indigo-600"
                      placeholder="حداقل ۶ کاراکتر"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    ایمیل / جیمیل اختصاصی (جهت ورود با جیمیل)
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white font-mono focus:outline-none focus:border-indigo-600"
                    placeholder="user@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    حقوق پایه ماهانه (تومان)
                  </label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    تاریخ استخدام (شمسی)
                  </label>
                  <input
                    type="text"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="۱۴۰۳/۰۱/۱۵"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  {editingEmployee ? 'ذخیره تغییرات' : 'افزودن کارمند'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
