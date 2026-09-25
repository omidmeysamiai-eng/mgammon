import React, { useState } from 'react';
import {
  Settings,
  Building2,
  MapPin,
  Save,
  CheckCircle,
  QrCode,
  DollarSign,
  Smartphone,
  ShieldCheck,
  History,
  Building,
  Image as ImageIcon,
  Camera,
  Upload,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { CompanySettings, AuditLog, Workshop, User } from '../../types';
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
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    logoUrl: settings.logoUrl || '',
    allowedGpsRadiusMeters: settings.allowedGpsRadiusMeters || 20,
    workshops: settings.workshops && settings.workshops.length > 0 ? settings.workshops : [
      {
        id: 'ws_1',
        name: 'کارگاه ۱ (اصلی - تولید و ساخت)',
        code: 'کارگاه ۱',
        lat: 35.75750,
        lng: 51.41000,
        allowedRadiusMeters: 20,
        address: 'کارگاه شماره ۱ - سالن اصلی'
      },
      {
        id: 'ws_2',
        name: 'کارگاه ۲ (فرعی - مونتاژ و انبار)',
        code: 'کارگاه ۲',
        lat: 35.75764,
        lng: 51.41015,
        allowedRadiusMeters: 20,
        address: 'کارگاه شماره ۲ - واحد مجاور'
      }
    ]
  });

  // Admin User Profile State
  const initialAdmin = StorageService.getUsers().find((u) => u.role === 'ADMIN') || {
    id: 'usr_admin',
    companyId: 'comp_mgommon_01',
    username: 'admin',
    name: 'مجید نورایی',
    email: 'm.nouraei@mgommon.ir',
    phone: '۰۹۱۲۱۰۰۲۰۰۰',
    role: 'ADMIN' as const,
    avatarUrl: ''
  };
  const [adminProfile, setAdminProfile] = useState<User>(initialAdmin);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    StorageService.updateUser(adminProfile);

    // Update matching employee if exists
    if (adminProfile.employeeId) {
      const emp = StorageService.getEmployees().find((x) => x.id === adminProfile.employeeId);
      if (emp) {
        StorageService.updateEmployee({
          ...emp,
          firstName: adminProfile.name.split(' ')[0] || emp.firstName,
          lastName: adminProfile.name.split(' ').slice(1).join(' ') || emp.lastName,
          phone: adminProfile.phone,
          avatarUrl: adminProfile.avatarUrl,
        });
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  const handleUpdateWorkshop = (index: number, field: keyof Workshop, value: any) => {
    const updated = [...formData.workshops];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, workshops: updated });
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>تنظیمات کارگاه‌ها، موقعیت ۲۰ متری و سیستم</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            پیکربندی موقعیت مکانی کارگاه ۱ و ۲، فاصله مجاز ثبت تردد، پنل پیامکی و ضرایب حقوق و دستمزد
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تنظیمات کارگاه‌ها
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
              <span>تنظیمات کارگاه‌ها و سیستم با موفقیت ذخیره گردید.</span>
            </div>
          )}

          {/* Section 1: Company Profile & Logo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>مشخصات مجموعه و برندینگ</span>
            </h3>

            {/* Custom Logo Upload & Path Card */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      لوگوی اختصاصی برنامه (نمایش در بالای هدر)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      لوگوی رسمی کارگاه به جای آیکون پیش‌فرض در سربرگ کل سامانه قرار می‌گیرد.
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>بارگذاری فایل لوگو</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-rose-200"
                      >
                        حذف لوگو
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Path Input for Host (e.g. /logo.png) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  مسیر فایل لوگو در هاست (یا آدرس اینترنتی):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="مثال: /logo.png یا /assets/logo.png یا https://..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-hidden focus:border-indigo-500"
                    dir="ltr"
                  />
                  {formData.logoUrl && (
                    <a
                      href={formData.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 shrink-0"
                    >
                      پیش‌نمایش
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  اگر فایل لوگو را روی هاست قرار داده‌اید، می‌توانید آدرس نسبی آن را مانند <code className="bg-slate-200/60 px-1 py-0.5 rounded">/logo.png</code> وارد کنید تا مستقیم از هاست خوانده شود.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نام مجموعه کارگاهی و برندینگ
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  کد شناسایی مجموعه
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
                <label className="block text-xs font-medium text-slate-700 mb-1">شماره تماس کارگاه</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نشانی کارگاه‌ها</label>
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

          {/* Section 1.5: Senior Manager Profile & Photo (مدیر ارشد: مجید نورایی) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>پروفایل و تصویر اختصاصی مدیر ارشد (مجید نورایی)</span>
              </h3>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                مالک و مدیریت عالی کارگاه
              </span>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                  {adminProfile.avatarUrl ? (
                    <img
                      src={adminProfile.avatarUrl}
                      alt="مدیر ارشد"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                {canEdit && (
                  <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-right flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800">
                  تصویر پرسنلی و پرتال مدیر ارشد
                </div>
                <p className="text-[11px] text-slate-500">
                  این تصویر در هدر برنامه، پنل پیام‌رسانی و کیوسک پایش نمایش داده می‌شود.
                </p>
                {canEdit && (
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start flex-wrap">
                    <label className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>بارگذاری عکس مدیر</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdminAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {adminProfile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAdminProfile({ ...adminProfile, avatarUrl: '' })}
                        className="text-[11px] text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        حذف عکس
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Admin Photo URL / Path on Host */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                یا آدرس عکس مدیر ارشد در هاست:
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={adminProfile.avatarUrl}
                onChange={(e) => setAdminProfile({ ...adminProfile, avatarUrl: e.target.value })}
                placeholder="مثال: /uploads/majid-nouraei.jpg یا https://..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-hidden focus:border-indigo-500"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نام مدیر ارشد:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={adminProfile.name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  شماره همراه مدیر:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ایمیل مدیر ارشد:
                </label>
                <input
                  type="email"
                  disabled={!canEdit}
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Two Workshops & 20-Meter GPS Radius */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>پیکربندی موقعیت مکانی کارگاه‌ها و شعاع مجاز تردد (حداکثر ۲۰ متر)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                محدوده مجاز پیش‌فرض: ۲۰ متر
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.workshops.map((ws, idx) => (
                <div key={ws.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      {ws.name}
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                      {ws.code}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        نام کارگاه:
                      </label>
                      <input
                        type="text"
                        disabled={!canEdit}
                        value={ws.name}
                        onChange={(e) => handleUpdateWorkshop(idx, 'name', e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          عرض جغرافیایی (Lat):
                        </label>
                        <input
                          type="number"
                          step="any"
                          disabled={!canEdit}
                          value={ws.lat}
                          onChange={(e) => handleUpdateWorkshop(idx, 'lat', Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          طول جغرافیایی (Lng):
                        </label>
                        <input
                          type="number"
                          step="any"
                          disabled={!canEdit}
                          value={ws.lng}
                          onChange={(e) => handleUpdateWorkshop(idx, 'lng', Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        شعاع مجاز برای ثبت تردد (متر):
                      </label>
                      <input
                        type="number"
                        disabled={!canEdit}
                        value={ws.allowedRadiusMeters || 20}
                        onChange={(e) => handleUpdateWorkshop(idx, 'allowedRadiusMeters', Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        به دلیل مجاورت کارگاه‌ها و نبود محوطه باز، فاصله مجاز حداکثر ۲۰ متر است.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* QR rotation */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  دوره تناوب چرخش کد QR داینامیک کیوسک (ثانیه):
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={formData.qrRefreshIntervalSeconds}
                  onChange={(e) =>
                    setFormData({ ...formData, qrRefreshIntervalSeconds: Number(e.target.value) })
                  }
                  className="w-full sm:w-48 text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                هر {formatNumberFa(formData.qrRefreshIntervalSeconds)} ثانیه بارکد جدید جهت جلوگیری از تقلب بازتولید می‌شود.
              </span>
            </div>
          </div>

          {/* Section 3: SMS Gateway Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>تنظیمات درگاه پیامک (SMS Panel Gateway)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سرشماره اختصاصی / خدماتی پیامک
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.smsSenderNumber || '500040001084'}
                  onChange={(e) => setFormData({ ...formData, smsSenderNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="500040001084"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  کلید API سامانه پیامکی (API Key)
                </label>
                <input
                  type="password"
                  disabled={!canEdit}
                  value={formData.smsApiKey || 'sms_live_api_key_mgommon'}
                  onChange={(e) => setFormData({ ...formData, smsApiKey: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payroll Constants */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>ثابت‌های قانونی حقوق، بیمه و مالیات</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  نرخ بیمه کارگر (٪)
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
                  نرخ مالیات بر درآمد (٪)
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
                  حق مسکن (تومان)
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
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات تنظیمات کارگاه</span>
              </button>
            </div>
          )}
        </form>
      ) : (
        /* AUDIT LOGS TAB */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>لاگ‌های ثبتی و امنیتی سامانه (Audit Trail)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {formatNumberFa(auditLogs.length)} رکورد ثبت‌شده
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {log.resource}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>ثبت‌کننده: {log.userName}</span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
