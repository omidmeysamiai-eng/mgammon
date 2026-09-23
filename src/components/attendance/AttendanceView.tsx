import React, { useState } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  Plus,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord, Employee, Shift } from '../../types';
import {
  formatShamsiDate,
  getTodayShamsi,
  minutesToHoursAndMinutes,
  getCurrentTimeStr
} from '../../utils/dateUtils';
import { StorageService } from '../../services/storage';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  shifts: Shift[];
  onRefresh: () => void;
  canManage: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  employees,
  shifts,
  onRefresh,
  canManage,
}) => {
  const [selectedDate, setSelectedDate] = useState(getTodayShamsi());
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Attendance Form
  const [manualForm, setManualForm] = useState({
    employeeId: employees[0]?.id || '',
    date: getTodayShamsi(),
    checkInTime: '08:00',
    checkOutTime: '17:00',
    status: 'PRESENT' as AttendanceRecord['status'],
    notes: '',
  });

  const filteredRecords = attendance.filter((rec) => {
    const matchesDate = !selectedDate || rec.date === selectedDate;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const getStatusBadge = (status: AttendanceRecord['status'], lateMins: number) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> حاضر به موقع
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> تأخیر ({lateMins} دقیقه)
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> غیبت غیرموجه
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3" /> در مرخصی
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            تعطیل رسمی
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    if (method === 'QR_CODE') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          <QrCode className="w-3 h-3" /> کیوسک QR
        </span>
      );
    }
    if (method === 'GPS') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
          <MapPin className="w-3 h-3" /> موقعیت GPS
        </span>
      );
    }
    return (
      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
        ثبت دستی
      </span>
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = StorageService.getSettings();
    const existing = attendance.find(
      (a) => a.employeeId === manualForm.employeeId && a.date === manualForm.date
    );

    // Calculate duration
    let durationMins = 0;
    if (manualForm.checkInTime && manualForm.checkOutTime) {
      const [inH, inM] = manualForm.checkInTime.split(':').map(Number);
      const [outH, outM] = manualForm.checkOutTime.split(':').map(Number);
      durationMins = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM) - 60);
    }

    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att_${Date.now()}`,
      companyId: settings.id,
      employeeId: manualForm.employeeId,
      date: manualForm.date,
      checkInTime: manualForm.checkInTime,
      checkOutTime: manualForm.checkOutTime,
      workDurationMinutes: durationMins,
      lateMinutes: 0,
      earlyExitMinutes: 0,
      overtimeMinutes: 0,
      status: manualForm.status,
      checkInMethod: 'MANUAL',
      checkOutMethod: 'MANUAL',
      notes: manualForm.notes || 'ثبت دستی توسط واحد منابع انسانی',
    };

    const updatedList = existing
      ? attendance.map((a) => (a.id === existing.id ? newRecord : a))
      : [newRecord, ...attendance];

    StorageService.saveAttendance(updatedList);
    StorageService.addAuditLog(
      'ثبت دستی تردد',
      'حضور و غیاب',
      `ثبت دستی رکورد پرسنل برای تاریخ ${manualForm.date}`
    );

    setIsManualModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>پایش و ثبت تردد روزانه پرسنل</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مشاهده ورود، خروج، تأخیرهای مجاز و غیرمجاز، کسر کار و اضافه‌کاری ثبت شده
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>ثبت یا اصلاح دستی تردد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">تاریخ مشاهده:</span>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="مثال: ۱۴۰۳/۰۷/۰۲"
              className="text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 w-32 font-mono text-center"
            />
          </div>

          <button
            onClick={() => setSelectedDate(getTodayShamsi())}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded bg-indigo-50"
          >
            امروز
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PRESENT">حاضر</option>
            <option value="LATE">تأخیر</option>
            <option value="ABSENT">غیبت</option>
            <option value="ON_LEAVE">در مرخصی</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">کارمند</th>
                <th className="py-3.5 px-4">کد پرسنلی</th>
                <th className="py-3.5 px-4">ورود (Check In)</th>
                <th className="py-3.5 px-4">خروج (Check Out)</th>
                <th className="py-3.5 px-4">کارکرد موثر</th>
                <th className="py-3.5 px-4">تأخیر / تعجیل</th>
                <th className="py-3.5 px-4">اضافه‌کاری</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4">روش ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    رکوردی برای تاریخ و فیلتر انتخاب شده ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {emp ? `${emp.firstName} ${emp.lastName}` : rec.employeeId}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {emp?.position}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {emp?.personalCode || '-'}
                      </td>

                      <td className="py-3 px-4">
                        {rec.checkInTime ? (
                          <div className="flex items-center gap-1 font-mono font-semibold text-emerald-700">
                            <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{rec.checkInTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rec.checkOutTime ? (
                          <div className="flex items-center gap-1 font-mono font-semibold text-rose-700">
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>{rec.checkOutTime}</span>
                          </div>
                        ) : rec.checkInTime ? (
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            در حال کار
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {minutesToHoursAndMinutes(rec.workDurationMinutes)}
                      </td>

                      <td className="py-3 px-4">
                        {rec.lateMinutes > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            {rec.lateMinutes} دقیقه تأخیر
                          </span>
                        ) : rec.earlyExitMinutes > 0 ? (
                          <span className="text-amber-600 font-semibold">
                            {rec.earlyExitMinutes} دقیقه تعجیل
                          </span>
                        ) : (
                          <span className="text-slate-400">به‌موقع</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rec.overtimeMinutes > 0 ? (
                          <span className="text-indigo-600 font-semibold font-mono">
                            +{rec.overtimeMinutes} دقیقه
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">۰</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(rec.status, rec.lateMinutes)}</td>

                      <td className="py-3 px-4">{getMethodBadge(rec.checkInMethod)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL ATTENDANCE MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>ثبت یا اصلاح دستی تردد</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  انتخاب پرسنل
                </label>
                <select
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.personalCode} - {emp.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  تاریخ تردد (شمسی)
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ساعت ورود
                  </label>
                  <input
                    type="time"
                    value={manualForm.checkInTime}
                    onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ساعت خروج
                  </label>
                  <input
                    type="time"
                    value={manualForm.checkOutTime}
                    onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  وضعیت تردد
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="PRESENT">حاضر به موقع</option>
                  <option value="LATE">دارای تأخیر</option>
                  <option value="ON_LEAVE">در مرخصی</option>
                  <option value="ABSENT">غیبت غیرموجه</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  توضیحات و علت ثبت دستی
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="علت ثبت دستی (مثال: عدم همراه داشتن گوشی، ماموریت اداری و...)"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  ثبت رکورد در پایگاه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
