import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Building2,
  MapPin,
  Save,
  Clock,
  History,
  CheckCircle,
  QrCode,
  DollarSign
} from 'lucide-react';
import { CompanySettings, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import { formatNumberFa } from '../../utils/dateUtils';

interface SettingsViewProps {
  settings: CompanySettings;
  auditLogs: AuditLog[];
  onRefresh: () => void;
  canEdit: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  auditLogs,
  onRefresh,
  canEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'AUDIT'>('SETTINGS');
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>تنظیمات شرکت و لاگ‌های امنیتی (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            پیکربندی پارامترهای پایه حقوق و دستمزد، مختصات موقعیت مکانی شرکت و ثبت کلیه وقایع حساس
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'SETTINGS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تنظیمات سازمان
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            گزارش رویدادها (Audit Logs)
          </button>
        </div>
      </div>

      {activeTab === 'SETTINGS' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>تنظیمات جدید شرکت با موفقیت در پایگاه داده ذخیره گردید.</span>
            </div>
          )}

          {/* Section 1: Company Profile */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>مشخصات سازمانی و هویتی</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نام رسمی شرکت / کسب‌وکار
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  شناسه ملی / کد شرکت
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.companyCode}
                  onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">شماره تماس پشتیبانی</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نشانی دفتر مرکزی</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: GPS Geofence and Dynamic QR */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>مختصات جغرافیایی دفتر و محدوده مجاز حضور (GPS & QR)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  عرض جغرافیایی (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={!canEdit}
                  value={formData.officeLat}
                  onChange={(e) => setFormData({ ...formData, officeLat: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  طول جغرافیایی (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  disabled={!canEdit}
                  value={formData.officeLng}
                  onChange={(e) => setFormData({ ...formData, officeLng: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  شعاع مجاز تردد (متر)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.allowedGpsRadiusMeters}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedGpsRadiusMeters: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                دوره تناوب چرخش کد QR داینامیک (ثانیه)
              </label>
              <input
                type="number"
                disabled={!canEdit}
                value={formData.qrRefreshIntervalSeconds}
                onChange={(e) =>
                  setFormData({ ...formData, qrRefreshIntervalSeconds: Number(e.target.value) })
                }
                className="w-full sm:w-64 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                توصیه امنیتی: بین ۲۰ تا ۴۵ ثانیه جهت جلوگیری از ارسال اسکرین‌شات
              </span>
            </div>
          </div>

          {/* Section 3: Payroll Base Constants */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>ضرایب و ثابت‌های قانونی حقوق و دستمزد</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نرخ بیمه سهم کارمند (٪)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.insuranceRatePercent}
                  onChange={(e) =>
                    setFormData({ ...formData, insuranceRatePercent: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نرخ پایه مالیات حقوق (٪)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.taxRatePercent}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRatePercent: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  کمک هزینه مسکن (تومان)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.fixedHousingAllowance}
                  onChange={(e) =>
                    setFormData({ ...formData, fixedHousingAllowance: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  بن خواربار کارگری (تومان)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.fixedGroceryAllowance}
                  onChange={(e) =>
                    setFormData({ ...formData, fixedGroceryAllowance: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-indigo-400" />
                <span>ذخیره تغییرات پیکربندی</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        /* AUDIT LOGS TAB */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>لاگ‌های امنیتی سیستم (Audit Trail - چه کسی، چه زمانی، چه تغییری)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {auditLogs.length} لاگ ثبت شده
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3 px-4">کاربر مجری</th>
                  <th className="py-3 px-4">نوع اقدام</th>
                  <th className="py-3 px-4">بخش مربوطه</th>
                  <th className="py-3 px-4">شرح تغییر</th>
                  <th className="py-3 px-4">زمان وقوع</th>
                  <th className="py-3 px-4">آدرس IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{log.resource}</td>
                    <td className="py-2.5 px-4 text-slate-700 max-w-sm truncate">{log.details}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '192.168.1.100'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
