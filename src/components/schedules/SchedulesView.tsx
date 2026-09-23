import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CheckCircle,
  X,
  Coffee
} from 'lucide-react';
import { Shift } from '../../types';
import { StorageService } from '../../services/storage';

interface SchedulesViewProps {
  shifts: Shift[];
  onRefresh: () => void;
  canEdit: boolean;
}

const WEEK_DAYS = [
  { id: 0, name: 'شنبه' },
  { id: 1, name: 'یکشنبه' },
  { id: 2, name: 'دوشنبه' },
  { id: 3, name: 'سه‌شنبه' },
  { id: 4, name: 'چهارشنبه' },
  { id: 5, name: 'پنج‌شنبه' },
  { id: 6, name: 'جمعه' },
];

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  shifts,
  onRefresh,
  canEdit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const defaultFormData: Omit<Shift, 'id' | 'companyId'> = {
    name: '',
    type: 'MORNING',
    startTime: '08:00',
    endTime: '17:00',
    thursdayEndTime: '13:00',
    breakDurationMinutes: 60,
    workDays: [0, 1, 2, 3, 4, 5],
    lateToleranceMinutes: 15,
    earlyExitToleranceMinutes: 10,
  };

  const [formData, setFormData] = useState<Omit<Shift, 'id' | 'companyId'>>(defaultFormData);

  const handleOpenAdd = () => {
    setEditingShift(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      type: shift.type,
      startTime: shift.startTime,
      endTime: shift.endTime,
      thursdayEndTime: shift.thursdayEndTime || '13:00',
      breakDurationMinutes: shift.breakDurationMinutes,
      workDays: [...shift.workDays],
      lateToleranceMinutes: shift.lateToleranceMinutes,
      earlyExitToleranceMinutes: shift.earlyExitToleranceMinutes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`آیا از حذف شیفت «${name}» اطمینان دارید؟`)) {
      StorageService.deleteShift(id);
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const settings = StorageService.getSettings();

    if (editingShift) {
      StorageService.updateShift({
        ...formData,
        id: editingShift.id,
        companyId: editingShift.companyId,
      });
    } else {
      StorageService.addShift({
        ...formData,
        id: `shift_${Date.now()}`,
        companyId: settings.id,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const toggleDay = (dayId: number) => {
    if (formData.workDays.includes(dayId)) {
      setFormData({
        ...formData,
        workDays: formData.workDays.filter((d) => d !== dayId),
      });
    } else {
      setFormData({
        ...formData,
        workDays: [...formData.workDays, dayId].sort(),
      });
    }
  };

  const getShiftIcon = (type: Shift['type']) => {
    switch (type) {
      case 'MORNING':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'EVENING':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'NIGHT':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'FLEXIBLE':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <span>مدیریت شیفت‌ها و تقویم کاری</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تعریف ساعات کاری، شناوری ورود و خروج، تایم استراحت و روزهای کاری رسمی
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>تعریف شیفت کاری جدید</span>
          </button>
        )}
      </div>

      {/* Standard Work Schedule Example Preview Card */}
      <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 lg:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800">
              الگوی زمان‌بندی قانون کار (شنبه تا چهارشنبه ۰۸:۰۰ الی ۱۷:۰۰ / پنج‌شنبه ۰۸:۰۰ الی ۱۳:۰۰)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            ۴۴ ساعت کار موظف هفتگی
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          ورود پرسنل تا ۱۵ دقیقه پس از ساعت مقرر بدون کسر کار لحاظ می‌شود و پس از آن به عنوان تأخیر در فیش حقوقی منظور خواهد شد.
        </p>
      </div>

      {/* Shifts Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getShiftIcon(shift.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{shift.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {shift.type === 'MORNING'
                        ? 'شیفت صبح (عادی اداری)'
                        : shift.type === 'EVENING'
                        ? 'شیفت عصرگاهی'
                        : shift.type === 'NIGHT'
                        ? 'شیفت شبانه'
                        : 'شناور'}
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(shift)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {shifts.length > 1 && (
                      <button
                        onClick={() => handleDelete(shift.id, shift.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Timing Details */}
              <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ساعت ورود و خروج:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {shift.startTime} الی {shift.endTime}
                  </span>
                </div>

                {shift.thursdayEndTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">پایان کار پنج‌شنبه:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {shift.thursdayEndTime}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-slate-400" />
                    زمان ناهار و استراحت:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {shift.breakDurationMinutes} دقیقه
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">شناوری و فرجه تأخیر:</span>
                  <span className="font-semibold text-emerald-600">
                    {shift.lateToleranceMinutes} دقیقه
                  </span>
                </div>
              </div>

              {/* Working Days */}
              <div className="mt-4">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                  روزهای فعال کاری:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {WEEK_DAYS.map((d) => {
                    const isWorking = shift.workDays.includes(d.id);
                    return (
                      <span
                        key={d.id}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          isWorking
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        {d.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SHIFT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <span>{editingShift ? 'ویرایش شیفت کاری' : 'تعریف شیفت کاری جدید'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نام شیفت <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: شیفت اداری دفتر مرکزی"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">نوع شیفت</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="MORNING">صبح (اداری)</option>
                    <option value="EVENING">عصر</option>
                    <option value="NIGHT">شب</option>
                    <option value="FLEXIBLE">شناور</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    مدت زمان استراحت و ناهار (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={formData.breakDurationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, breakDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ساعت شروع</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ساعت پایان</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">پایان پنج‌شنبه</label>
                  <input
                    type="time"
                    value={formData.thursdayEndTime}
                    onChange={(e) => setFormData({ ...formData, thursdayEndTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    شناوری ورود مجاز (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={formData.lateToleranceMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, lateToleranceMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    تعجیل خروج مجاز (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={formData.earlyExitToleranceMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, earlyExitToleranceMinutes: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Work days picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  روزهای کاری این شیفت:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = formData.workDays.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`py-2 text-xs rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  ذخیره شیفت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
