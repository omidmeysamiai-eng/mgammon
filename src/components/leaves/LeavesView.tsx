import React, { useState } from 'react';
import {
  PlaneTakeoff,
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Filter,
  Check,
  X
} from 'lucide-react';
import { LeaveRequest, Employee, User as AppUser } from '../../types';
import { StorageService } from '../../services/storage';
import { getTodayShamsi, formatShamsiDate } from '../../utils/dateUtils';

interface LeavesViewProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  currentUser: AppUser;
  onRefresh: () => void;
  canApprove: boolean;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaves,
  employees,
  currentUser,
  onRefresh,
  canApprove,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form for new request
  const [formData, setFormData] = useState({
    employeeId: currentUser.employeeId || employees[0]?.id || '',
    type: 'EARNED' as LeaveRequest['type'],
    startDate: getTodayShamsi(),
    endDate: getTodayShamsi(),
    startTime: '10:00',
    endTime: '12:00',
    durationDays: 1,
    durationHours: 2,
    reason: '',
  });

  const filteredLeaves = leaves.filter((l) => {
    // If employee role, show only their leaves
    if (currentUser.role === 'EMPLOYEE' && currentUser.employeeId && l.employeeId !== currentUser.employeeId) {
      return false;
    }
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    StorageService.reviewLeaveRequest(id, true, currentUser.name);
    onRefresh();
  };

  const handleReject = () => {
    if (!rejectingId) return;
    StorageService.reviewLeaveRequest(rejectingId, false, currentUser.name, rejectionReason || 'عدم موافقت با توجه به تداخل کاری');
    setRejectingId(null);
    setRejectionReason('');
    onRefresh();
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((emp) => emp.id === formData.employeeId);
    if (!emp) return;

    StorageService.submitLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.type === 'HOURLY' ? formData.startTime : undefined,
      endTime: formData.type === 'HOURLY' ? formData.endTime : undefined,
      durationDays: formData.type === 'HOURLY' ? undefined : formData.durationDays,
      durationHours: formData.type === 'HOURLY' ? formData.durationHours : undefined,
      reason: formData.reason || 'امور شخصی',
    });

    setIsSubmitModalOpen(false);
    onRefresh();
  };

  const getLeaveTypeBadge = (type: LeaveRequest['type']) => {
    switch (type) {
      case 'EARNED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">استحقاقی</span>;
      case 'HOURLY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">ساعتی</span>;
      case 'MEDICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">استعلاجی</span>;
      case 'UNPAID':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">بدون حقوق</span>;
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> موافقت شد
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> رد شد
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <AlertCircle className="w-3 h-3" /> در انتظار بررسی
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-indigo-600" />
            <span>مدیریت درخواست‌های مرخصی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            فرآیند ثبت، بررسی، تأیید/رد مرخصی‌های روزانه، ساعتی و استعلاجی با به‌روزرسانی خودکار جدول حضور
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>ثبت درخواست مرخصی</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>فیلتر وضعیت:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">همه درخواست‌ها</option>
            <option value="PENDING">در انتظار بررسی</option>
            <option value="APPROVED">تأیید شده</option>
            <option value="REJECTED">رد شده</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          مجموع درخواست‌ها: {filteredLeaves.length} مورد
        </span>
      </div>

      {/* Leaves: Cards (Mobile) & Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredLeaves.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              هیچ درخواست مرخصی با این مشخصات ثبت نشده است.
            </div>
          ) : (
            filteredLeaves.map((req) => (
              <div key={req.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {req.employeeName}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {getLeaveTypeBadge(req.type)}
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {req.type === 'HOURLY'
                          ? `${req.durationHours || 2} ساعت`
                          : `${req.durationDays || 1} روز`}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">بازه تاریخی:</span>
                    <span className="font-mono text-slate-700">
                      {req.type === 'HOURLY' ? (
                        `${req.startDate} (${req.startTime} الی ${req.endTime})`
                      ) : (
                        `${req.startDate} ${req.startDate !== req.endDate ? `تا ${req.endDate}` : ''}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 shrink-0">دلیل:</span>
                    <span className="text-slate-700 text-right">{req.reason}</span>
                  </div>

                  {req.reviewedBy && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
                      <span>بررسی: <strong>{req.reviewedBy}</strong></span>
                      <span className="text-[10px] text-slate-400">{req.reviewedAt}</span>
                    </div>
                  )}
                </div>

                {/* Manager Action Buttons on Mobile Card */}
                {canApprove && req.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>تأیید مرخصی</span>
                    </button>
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>رد درخواست</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">کارمند</th>
                <th className="py-3.5 px-4">نوع مرخصی</th>
                <th className="py-3.5 px-4">بازه تاریخی / ساعت</th>
                <th className="py-3.5 px-4">مدت</th>
                <th className="py-3.5 px-4">دلیل درخواست</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4">بررسی‌کننده</th>
                {canApprove && <th className="py-3.5 px-4 text-center">اقدام مدیر</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    هیچ درخواست مرخصی با این مشخصات ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {req.employeeName}
                    </td>

                    <td className="py-3 px-4">{getLeaveTypeBadge(req.type)}</td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {req.type === 'HOURLY' ? (
                        <span>
                          {req.startDate} ({req.startTime} الی {req.endTime})
                        </span>
                      ) : (
                        <span>
                          {req.startDate} {req.startDate !== req.endDate ? `تا ${req.endDate}` : ''}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {req.type === 'HOURLY'
                        ? `${req.durationHours || 2} ساعت`
                        : `${req.durationDays || 1} روز`}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {req.reason}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(req.status)}</td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {req.reviewedBy ? (
                        <div>
                          <div className="font-semibold text-slate-700">{req.reviewedBy}</div>
                          <div className="text-[10px] text-slate-400">{req.reviewedAt}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>تأیید</span>
                            </button>
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>رد</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">بررسی شده</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800">علت رد درخواست مرخصی</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="لطفاً دلیل مخالفت با مرخصی را وارد کنید..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-600 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                ثبت رد مرخصی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT LEAVE REQUEST MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <PlaneTakeoff className="w-4 h-4 text-indigo-600" />
                <span>ثبت درخواست مرخصی جدید</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">پرسنل متقاضی</label>
                <select
                  value={formData.employeeId}
                  disabled={currentUser.role === 'EMPLOYEE'}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} (مانده مرخصی: {emp.remainingLeaveDays} روز)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نوع مرخصی</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="EARNED">استحقاقی (کسر از مرخصی سالانه)</option>
                  <option value="HOURLY">ساعتی (طول روز کاری)</option>
                  <option value="MEDICAL">استعلاجی (نیازمند گواهی پزشک)</option>
                  <option value="UNPAID">بدون حقوق</option>
                </select>
              </div>

              {formData.type === 'HOURLY' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ</label>
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">از ساعت</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">تا ساعت</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ شروع</label>
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">تاریخ پایان</label>
                    <input
                      type="text"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">علت و توضیحات</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="علت درخواست مرخصی را وارد فرمایید..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  ارسال جهت بررسی مدیر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
