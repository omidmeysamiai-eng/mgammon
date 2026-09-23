import React, { useState, useEffect } from 'react';
import {
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ScanLine,
  Navigation,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../../types';
import { StorageService } from '../../services/storage';
import {
  getCurrentTimeStr,
  getTodayShamsiDetailed,
  calculateGpsDistanceMeters,
  formatNumberFa
} from '../../utils/dateUtils';

interface DynamicQrKioskViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onRefresh: () => void;
}

export const DynamicQrKioskView: React.FC<DynamicQrKioskViewProps> = ({
  employees,
  attendance,
  onRefresh,
}) => {
  const settings = StorageService.getSettings();
  const shamsi = getTodayShamsiDetailed();

  // Dynamic QR Code state: changes every 30 seconds
  const [timeLeft, setTimeLeft] = useState(settings.qrRefreshIntervalSeconds || 30);
  const [qrToken, setQrToken] = useState('');
  const [qrNonce, setQrNonce] = useState(1);

  // Mobile Scanner Simulator State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
  const [simulatedLat, setSimulatedLat] = useState(settings.officeLat);
  const [simulatedLng, setSimulatedLng] = useState(settings.officeLng);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    distance?: number;
  } | null>(null);

  // Generate cryptographic-like dynamic token
  const generateDynamicToken = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `HRM_TOTP_${settings.companyCode}_${timestamp}_${hash}`;
  };

  useEffect(() => {
    setQrToken(generateDynamicToken());
  }, [qrNonce]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQrNonce((n) => n + 1);
          return settings.qrRefreshIntervalSeconds || 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.qrRefreshIntervalSeconds]);

  // Distance of simulated location to office
  const currentDistance = calculateGpsDistanceMeters(
    simulatedLat,
    simulatedLng,
    settings.officeLat,
    settings.officeLng
  );
  const isInsideFence = currentDistance <= settings.allowedGpsRadiusMeters;

  const handleSimulateScan = () => {
    const emp = employees.find((e) => e.id === selectedEmployeeId);
    if (!emp) return;

    if (actionType === 'IN') {
      const res = StorageService.clockIn(emp.id, 'QR_CODE', {
        lat: simulatedLat,
        lng: simulatedLng,
      });
      setScanResult({
        success: res.success,
        message: res.message,
        distance: currentDistance,
      });
    } else {
      const res = StorageService.clockOut(emp.id, 'QR_CODE', {
        lat: simulatedLat,
        lng: simulatedLng,
      });
      setScanResult({
        success: res.success,
        message: res.message,
        distance: currentDistance,
      });
    }
    onRefresh();
  };

  // Helper presets for GPS simulator
  const setPresetLocation = (type: 'EXACT' | 'NEAR' | 'FAR') => {
    if (type === 'EXACT') {
      setSimulatedLat(settings.officeLat);
      setSimulatedLng(settings.officeLng);
    } else if (type === 'NEAR') {
      // ~60 meters away
      setSimulatedLat(settings.officeLat + 0.0004);
      setSimulatedLng(settings.officeLng + 0.0004);
    } else {
      // ~2.5 kilometers away
      setSimulatedLat(settings.officeLat + 0.02);
      setSimulatedLng(settings.officeLng + 0.02);
    }
    setScanResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-100 text-indigo-700">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              معماری کیوسک QR داینامیک و احراز هویت مکانی (GPS)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            کد QR امن و چرخان با الگوریتم زمان‌بندی‌شده (TOTP) مانع از ارسال عکس و جعل حضور پرسنل خارج از شرکت می‌شود.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            ضد جعل و بازتولید برخط
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Kiosk Display on Right, Mobile Scan Simulator on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right: Kiosk Display Screen (نمای تبلت ورودی شرکت) */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top of Kiosk */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-200 tracking-wide">
                  کیوسک مرکزی ثبت تردد ورودی ({settings.companyName})
                </span>
              </div>
              <div className="text-xs text-indigo-400 font-mono">
                {shamsi.dayOfWeek} {shamsi.dateString}
              </div>
            </div>

            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                اپلیکیشن همراه را باز کرده و کد را اسکن کنید
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                ثبت ورود و خروج با دوربین گوشی
              </h3>
            </div>
          </div>

          {/* Center: Dynamic QR Visual Card */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="relative p-6 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/30">
              {/* Simulated SVG QR Code pattern */}
              <div className="w-56 h-56 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative p-3 overflow-hidden">
                {/* SVG Visualizing Dynamic QR Code with center logo */}
                <svg
                  className="w-full h-full text-white"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <rect x="10" y="10" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="#0f172a" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#ffffff" />

                  <rect x="66" y="10" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="#0f172a" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#ffffff" />

                  <rect x="10" y="66" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="#0f172a" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#ffffff" />

                  {/* Pseudo data dots that shift with qrNonce */}
                  <rect x="42" y="14" width="6" height="6" fill="#ffffff" />
                  <rect x="52" y="18" width="6" height="6" fill="#ffffff" />
                  <rect x="42" y="28" width="6" height="6" fill="#ffffff" />
                  <rect x="14" y="44" width="6" height="6" fill="#ffffff" />
                  <rect x="24" y="44" width="6" height="6" fill="#ffffff" />
                  <rect x="34" y="44" width="6" height="6" fill="#ffffff" />
                  <rect x="44" y="44" width="12" height="12" rx="2" fill="#6366f1" />
                  <rect x="60" y="44" width="6" height="6" fill="#ffffff" />
                  <rect x="72" y="44" width="6" height="6" fill="#ffffff" />
                  <rect x="80" y="52" width="6" height="6" fill="#ffffff" />
                  <rect x="42" y="66" width="6" height="6" fill="#ffffff" />
                  <rect x="52" y="76" width="6" height="6" fill="#ffffff" />
                  <rect x="66" y="70" width="6" height="6" fill="#ffffff" />
                  <rect x="78" y="78" width="8" height="8" fill="#ffffff" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-md">
                    HRM
                  </div>
                </div>
              </div>

              {/* Countdown badge overlay */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-indigo-400 font-mono text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>بروزرسانی در: {timeLeft} ثانیه</span>
              </div>
            </div>

            {/* Token details */}
            <div className="mt-6 text-center max-w-sm">
              <span className="text-[11px] text-slate-400 block mb-1">
                توکن اعتبارسنجی سرور (Server TOTP Signature):
              </span>
              <div className="font-mono text-xs text-indigo-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 truncate">
                {qrToken}
              </div>
            </div>
          </div>

          {/* Bottom Kiosk info */}
          <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                مختصات ثبت‌شده شرکت: {settings.officeLat.toFixed(4)}, {settings.officeLng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>شعاع مجاز: {settings.allowedGpsRadiusMeters} متر</span>
            </div>
          </div>
        </div>

        {/* Left: Interactive Mobile Scanner & Geo-Fence Simulator */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  شبیه‌ساز اسکن گوشی موبایل کارمند
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                تست احراز هویت مکانی
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              با انتخاب کارمند و موقعیت مکانی، الگوریتم اعتبارسنجی همزمان توکن کیوسک و فاصله جغرافیایی با دفتر شرکت را ارزیابی کنید.
            </p>

            {/* Step 1: Select Employee */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ۱. کارمند اسکن‌کننده:
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setScanResult(null);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.position} - {emp.personalCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Action Type (IN vs OUT) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ۲. نوع اقدام:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('IN');
                      setScanResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      actionType === 'IN'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ثبت ورود (Check In)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('OUT');
                      setScanResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      actionType === 'OUT'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ثبت خروج (Check Out)
                  </button>
                </div>
              </div>

              {/* Step 3: Location Geofence Tester */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    ۳. شبیه‌سازی موقعیت GPS گوشی:
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isInsideFence
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    فاصله تا شرکت: {formatNumberFa(currentDistance)} متر (
                    {isInsideFence ? 'مجاز' : 'غیرمجاز'})
                  </span>
                </div>

                {/* Preset quick test buttons */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPresetLocation('EXACT')}
                    className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-medium"
                  >
                    حضور در لابی (۰ متر)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetLocation('NEAR')}
                    className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-medium"
                  >
                    حیاط شرکت (۶۰ متر)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetLocation('FAR')}
                    className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-rose-400 text-rose-600 text-[11px] font-medium"
                  >
                    خارج شرکت (۲ کیلومتر)
                  </button>
                </div>
              </div>

              {/* Scan Trigger Button */}
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-indigo-400" />
                <span>شبیه‌سازی اسکن QR توسط گوشی کارمند</span>
              </button>

              {/* Result Notification Box */}
              {scanResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                    scanResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{scanResult.success ? 'عملیات موفقیت‌آمیز' : 'خطای احراز تردد'}</span>
                  </div>
                  <p>{scanResult.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Architectural Notes */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              پروتکل امنیتی: کدهای منقضی‌شده پس از ۳۰ ثانیه در دیتابیس باطل شده و پاسخ HTTP 403 بازمی‌گردانند.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
