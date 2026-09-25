import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { AdvanceRequest, Employee, User } from '../../types';
import { StorageService } from '../../services/storage';
import {
  formatCurrencyTomans,
  getTodayShamsi,
  formatShamsiDate
} from '../../utils/dateUtils';

interface AdvancesViewProps {
  advances: AdvanceRequest[];
  employees: Employee[];
  currentUser: User;
  onRefresh: () => void;
  canApprove: boolean;
}

export const AdvancesView: React.FC<AdvancesViewProps> = ({
  advances,
  employees,
  currentUser,
  onRefresh,
  canApprove,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form
  const [formData, setFormData] = useState({
    employeeId: currentUser.employeeId || employees[0]?.id || '',
    amount: 5000000,
    repayMonth: '۱۴۰۳/۰۷',
    reason: '',
  });

  const filteredAdvances = advances.filter((adv) => {
    if (currentUser.role === 'EMPLOYEE' && currentUser.employeeId && adv.employeeId !== currentUser.employeeId) {
      return false;
    }
    return true;
  });

  const handleApprove = (id: string) => {
    StorageService.reviewAdvanceRequest(id, true, currentUser.name);
    onRefresh();
  };

  const handleReject = () => {
    if (!rejectingId) return;
    StorageService.reviewAdvanceRequest(
      rejectingId,
      false,
      currentUser.name,
      rejectionReason || 'عدم امکان پرداخت مساعده در این ماه به دلیل محدودیت بودجه'
    );
    setRejectingId(null);
    setRejectionReason('');
    onRefresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formData.employeeId);
    if (!emp) return;

    StorageService.submitAdvanceRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      amount: formData.amount,
      requestDate: getTodayShamsi(),
      repayMonth: formData.repayMonth,
      reason: formData.reason,
    });

    setIsSubmitModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            <span>مدیریت درخواست‌های مساعده حقوق (علی‌الحساب)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ثبت، تأیید و کسر خودکار مساعده‌های دریافتی از فیش حقوقی پایان ماه پرسنل
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>ثبت درخواست مساعده</span>
        </button>
      </div>

      {/* Policy Notice Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">سیاست پرداخت مساعده:</span>
          حداکثر سقف مجاز دریافت مساعده، ۳۰ درصد از خالص حقوق پایه کارمند بوده و پس از تأیید مدیر مالی به صورت مستقیم در ستون کسورات فیش همان ماه ثبت می‌گردد.
        </div>
      </div>

      {/* Advances: Cards (Mobile) & Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredAdvances.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              هیچ درخواست مساعده‌ای ثبت نشده است.
            </div>
          ) : (
            filteredAdvances.map((adv) => (
              <div key={adv.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{adv.employeeName}</div>
                    <div className="text-xs text-emerald-600 font-bold font-mono mt-0.5">
                      {formatCurrencyTomans(adv.amount)}
                    </div>
                  </div>
                  <div>
                    {adv.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> تأیید شده
                      </span>
                    ) : adv.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" /> رد شده
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> در انتظار تأیید
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">تاریخ درخواست:</span>
                    <span className="font-mono text-slate-700">{adv.requestDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">کسر از حقوق ماه:</span>
                    <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {adv.repayMonth}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 shrink-0">علت درخواست:</span>
                    <span className="text-slate-700 text-right">{adv.reason}</span>
                  </div>
                  {adv.reviewedBy && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
                      <span>بررسی: <strong>{adv.reviewedBy}</strong></span>
                      <span className="text-[10px] text-slate-400">{adv.reviewedAt}</span>
                    </div>
                  )}
                </div>

                {/* Manager Action Buttons on Mobile Card */}
                {canApprove && adv.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(adv.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>موافقت و پرداخت</span>
                    </button>
                    <button
                      onClick={() => setRejectingId(adv.id)}
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
                <th className="py-3.5 px-4">کارمند متقاضی</th>
                <th className="py-3.5 px-4">مبلغ درخواستی</th>
                <th className="py-3.5 px-4">تاریخ درخواست</th>
                <th className="py-3.5 px-4">ماه تسویه در فیش</th>
                <th className="py-3.5 px-4">علت درخواست</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4">تأییدکننده</th>
                {canApprove && <th className="py-3.5 px-4 text-center">اقدام</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    هیچ درخواست مساعده‌ای ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{adv.employeeName}</td>

                    <td className="py-3 px-4 font-bold text-emerald-600 font-mono">
                      {formatCurrencyTomans(adv.amount)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">{adv.requestDate}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-medium text-[11px]">
                        {adv.repayMonth}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">{adv.reason}</td>

                    <td className="py-3 px-4">
                      {adv.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> تأیید شده
                        </span>
                      ) : adv.status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> رد شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          <AlertCircle className="w-3 h-3" /> در انتظار تأیید
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {adv.reviewedBy ? (
                        <div>
                          <div className="font-semibold text-slate-700">{adv.reviewedBy}</div>
                          <div className="text-[10px] text-slate-400">{adv.reviewedAt}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {canApprove && (
                      <td className="py-3 px-4 text-center">
                        {adv.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApprove(adv.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>موافقت</span>
                            </button>
                            <button
                              onClick={() => setRejectingId(adv.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>رد</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px]">انجام شده</span>
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
            <h3 className="text-sm font-bold text-slate-800">علت مخالفت با مساعده</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="علت عدم تأیید را بنویسید..."
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
                ثبت رد مساعده
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT ADVANCE MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span>ثبت درخواست مساعده حقوق</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  پرسنل متقاضی
                </label>
                <select
                  value={formData.employeeId}
                  disabled={currentUser.role === 'EMPLOYEE'}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({formatCurrencyTomans(emp.baseSalary)} پایه)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    مبلغ مساعده (تومان) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatCurrencyTomans(formData.amount)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ماه تسویه در فیش <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.repayMonth}
                    onChange={(e) => setFormData({ ...formData, repayMonth: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="۱۴۰۳/۰۷"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  توضیحات و علت نیاز به مساعده
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="مثال: هزینه فوری درمان یا اقساط بانکی..."
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
                  ارسال درخواست مساعده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
