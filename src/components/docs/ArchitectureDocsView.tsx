import React, { useState } from 'react';
import {
  FileCode2,
  Database,
  Server,
  Terminal,
  Shield,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Code
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  MANAGER
  EMPLOYEE
}

enum ShiftType {
  MORNING
  EVENING
  NIGHT
  FLEXIBLE
}

enum AttendanceStatus {
  PRESENT
  LATE
  EARLY_LEAVE
  ABSENT
  ON_LEAVE
  HOLIDAY
}

enum LeaveType {
  EARNED
  HOURLY
  UNPAID
  MEDICAL
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model Company {
  id                    String            @id @default(uuid())
  name                  String
  code                  String            @unique
  address               String?
  phone                 String?
  officeLat             Float             @default(35.7219)
  officeLng             Float             @default(51.3347)
  allowedGpsRadius      Int               @default(150)
  qrRefreshIntervalSec  Int               @default(30)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  users                 User[]
  employees             Employee[]
  shifts                Shift[]
  auditLogs             AuditLog[]
}

model User {
  id           String    @id @default(uuid())
  companyId    String
  company      Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  username     String    @unique
  passwordHash String
  name         String
  email        String    @unique
  role         Role      @default(EMPLOYEE)
  employeeId   String?   @unique
  employee     Employee? @relation(fields: [employeeId], references: [id])
  refreshToken String?   @db.Text
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Employee {
  id                 String             @id @default(uuid())
  companyId          String
  company            Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  personalCode       String             @unique
  nationalCode       String             @unique
  firstName          String
  lastName           String
  phone              String
  email              String
  department         String
  position           String
  hireDate           String
  status             String             @default("ACTIVE")
  baseSalary         BigInt
  hourlyRate         BigInt
  overtimeRate       Float              @default(1.4)
  remainingLeaveDays Int                @default(20)
  shebaNumber        String?
  bankAccount        String?
  shiftId            String
  shift              Shift              @relation(fields: [shiftId], references: [id])
  user               User?
  attendances        AttendanceRecord[]
  leaves             LeaveRequest[]
  advances           AdvanceRequest[]
  salaries           SalaryRecord[]
  bonuses            BonusOrPenalty[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model Shift {
  id                      String     @id @default(uuid())
  companyId               String
  company                 Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name                    String
  type                    ShiftType  @default(MORNING)
  startTime               String     // "08:00"
  endTime                 String     // "17:00"
  breakDurationMinutes    Int        @default(60)
  workDaysJson            String     // "[0,1,2,3,4,5]"
  lateToleranceMinutes    Int        @default(15)
  earlyExitToleranceMins  Int        @default(10)
  employees               Employee[]
}

model AttendanceRecord {
  id                  String           @id @default(uuid())
  employeeId          String
  employee            Employee         @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date                String           // Shamsi date: "1403/07/02"
  checkInTime         String?
  checkOutTime        String?
  workDurationMinutes Int              @default(0)
  lateMinutes         Int              @default(0)
  earlyExitMinutes    Int              @default(0)
  overtimeMinutes     Int              @default(0)
  status              AttendanceStatus @default(PRESENT)
  checkInMethod       String?          // "QR_CODE" | "GPS" | "MANUAL"
  checkOutMethod      String?
  verifiedLat         Float?
  verifiedLng         Float?
  notes               String?
  createdAt           DateTime         @default(now())

  @@unique([employeeId, date])
}

model LeaveRequest {
  id              String        @id @default(uuid())
  employeeId      String
  employee        Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  type            LeaveType     @default(EARNED)
  startDate       String
  endDate         String
  startTime       String?
  endTime         String?
  durationDays    Int?
  durationHours   Int?
  reason          String
  status          RequestStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      String?
  rejectionReason String?
  createdAt       DateTime      @default(now())
}

model AdvanceRequest {
  id              String        @id @default(uuid())
  employeeId      String
  employee        Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  amount          BigInt
  requestDate     String
  repayMonth      String        // "1403/07"
  reason          String
  status          RequestStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      String?
  createdAt       DateTime      @default(now())
}

model SalaryRecord {
  id                 String   @id @default(uuid())
  employeeId         String
  employee           Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  month              String   // "1403/07"
  baseSalary         BigInt
  workDays           Int
  workedHours        Float
  overtimeHours      Float
  overtimeAmount     BigInt
  bonusesTotal       BigInt   @default(0)
  penaltiesTotal     BigInt   @default(0)
  advancesTotal      BigInt   @default(0)
  insuranceDeduction BigInt
  taxDeduction       BigInt
  housingAllowance   BigInt
  groceryAllowance   BigInt
  grossSalary        BigInt
  netSalary          BigInt
  status             String   @default("DRAFT")
  paymentDate        String?
  createdAt          DateTime @default(now())

  @@unique([employeeId, month])
}

model BonusOrPenalty {
  id          String   @id @default(uuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  type        String   // "BONUS" | "PENALTY"
  amount      BigInt
  date        String
  month       String
  title       String
  description String?
  createdAt   DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  companyId String
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  userId    String
  userName  String
  action    String
  resource  String
  details   String   @db.Text
  ipAddress String?
  timestamp String
  createdAt DateTime @default(now())
}`;

  const cpanelDeploymentCode = `# راهنمای استقرار (Deployment) در cPanel با سرویس Setup Node.js App

# ۱. ساخت دیتابیس MySQL در cPanel:
# وارد MySQL Databases در cPanel شوید، دیتابیس و کاربر با دسترسی کامل بسازید.

# ۲. ایجاد برنامه Node.js در cPanel:
# در بخش "Setup Node.js App" دکمه "Create Application" را بزنید:
# - Node.js version: 18.x یا 20.x
# - Application mode: Production
# - Application root: /home/username/hrm-app
# - Application startup file: dist/server.js

# ۳. تنظیم فایل محیطی (.env):
DATABASE_URL="mysql://username_dbuser:StrongPassword@localhost:3306/username_hrmdb"
JWT_SECRET="YOUR_SUPER_SECURE_JWT_SECRET_KEY"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="YOUR_REFRESH_TOKEN_SECRET_KEY"
REFRESH_TOKEN_EXPIRES_IN="7d"
PORT=3000

# ۴. اجرای دستورات مهاجرت دیتابیس در ترمینال cPanel:
cd /home/username/hrm-app
npm install
npx prisma generate
npx prisma db push
npm run build

# ۵. راه‌اندازی:
# در پنل Node.js App روی دکمه "Restart" کلیک کنید.`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            <span>مستندات معماری نرم‌افزار، ساختار دیتابیس (Prisma) و استقرار cPanel</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مشخصات کامل معماری چندشرکتی (Multi-Tenant SaaS Ready)، جداول MySQL و API های بک‌اند Node.js
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Node.js + Express + Prisma + MySQL
          </span>
        </div>
      </div>

      {/* 3 Pillars Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">دیتابیس رابطه‌ای (MySQL)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            مدل‌سازی شده با Prisma ORM دارای Foreign Key ها، شاخص‌های جستجوی سریع و فیلد companyId جهت توسعه به پلتفرم SaaS.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">احراز هویت و امنیت (JWT)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            استفاده از Access Token های کوتاه مدت (۱۵ دقیقه) همراه با Refresh Token چرخان در HttpOnly Cookie و هش رمز عبور با bcrypt.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">استقرار روی cPanel</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            کاملاً سازگار با سرویس Node.js Selector در پنل‌های هاستینگ cPanel/DirectAdmin با انجین Express.
          </p>
        </div>
      </div>

      {/* Section 1: Prisma Schema Code */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              prisma/schema.prisma (ساختار کامل دیتابیس MySQL)
            </span>
          </div>

          <button
            onClick={() => copyCode('prisma', prismaSchemaCode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
          >
            {copiedKey === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'prisma' ? 'کپی شد' : 'کپی شمای دیتابیس'}</span>
          </button>
        </div>

        <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-indigo-200/90 max-h-96 overflow-y-auto p-2" dir="ltr">
          {prismaSchemaCode}
        </pre>
      </div>

      {/* Section 2: Core REST API Endpoints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>فهرست نقاط پایانی وب‌سرویس (RESTful API Specification)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3 px-4">متد و مسیر</th>
                <th className="py-3 px-4">نقش مجاز (RBAC)</th>
                <th className="py-3 px-4">شرح عملکرد</th>
                <th className="py-3 px-4">پارامترهای کلیدی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">POST /api/auth/login</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">عمومی</span></td>
                <td className="py-2.5 px-4">ورود به سیستم و دریافت JWT Token و Refresh Token</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">username, password</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-blue-600">GET /api/employees</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">ADMIN / MANAGER</span></td>
                <td className="py-2.5 px-4">دریافت لیست پرسنل همراه با فیلتر واحد و وضعیت</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">page, limit, dept</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">POST /api/attendance/clock-in</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">EMPLOYEE</span></td>
                <td className="py-2.5 px-4">ثبت ورود همراه با اعتبارسنجی TOTP کد QR و مختصات GPS</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">token, lat, lng</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">POST /api/attendance/clock-out</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">EMPLOYEE</span></td>
                <td className="py-2.5 px-4">ثبت خروج و محاسبه خودکار کارکرد موثر و اضافه‌کاری</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">token, lat, lng</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-purple-600">POST /api/leaves/request</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">EMPLOYEE</span></td>
                <td className="py-2.5 px-4">ثبت درخواست مرخصی روزانه، ساعتی یا استعلاجی</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">type, startDate, duration</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-amber-600">PATCH /api/leaves/:id/review</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">ADMIN / MANAGER</span></td>
                <td className="py-2.5 px-4">تأیید یا رد مرخصی و به‌روزرسانی کارنامه حضور</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">status, rejectionReason</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">POST /api/payroll/calculate</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">ADMIN</span></td>
                <td className="py-2.5 px-4">محاسبه دسته‌جمعی حقوق و صدور فیش‌های رسمی ماهانه</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">month</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: cPanel Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>دستورالعمل استقرار مستقیم روی cPanel (Node.js Application)</span>
          </h3>

          <button
            onClick={() => copyCode('cpanel', cpanelDeploymentCode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
          >
            {copiedKey === 'cpanel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>کپی دستورات ترمینال</span>
          </button>
        </div>

        <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl font-mono leading-relaxed overflow-x-auto" dir="ltr">
          {cpanelDeploymentCode}
        </pre>
      </div>
    </div>
  );
};
