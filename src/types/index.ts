export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  companyId: string;
  employeeId?: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface Employee {
  id: string;
  companyId: string;
  personalCode: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  hireDate: string; // Shamsi string e.g. 1402/05/15
  status: EmployeeStatus;
  shiftId: string;
  avatarUrl?: string;
  bankAccount?: string;
  shebaNumber?: string;
  baseSalary: number; // in Tomans
  hourlyRate: number; // in Tomans
  overtimeRate: number; // multiplier e.g. 1.4
  remainingLeaveDays: number;
}

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  type: 'MORNING' | 'EVENING' | 'NIGHT' | 'FLEXIBLE';
  startTime: string; // "08:00"
  endTime: string; // "17:00"
  breakDurationMinutes: number; // 60
  workDays: number[]; // 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  lateToleranceMinutes: number; // 15 mins
  earlyExitToleranceMinutes: number; // 10 mins
  thursdayEndTime?: string; // "13:00"
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'ON_LEAVE' | 'HOLIDAY';

export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  date: string; // Shamsi date string e.g. 1403/07/02
  checkInTime?: string; // "08:05"
  checkOutTime?: string; // "17:15"
  workDurationMinutes: number; // total worked minutes
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeMinutes: number;
  status: AttendanceStatus;
  checkInMethod?: 'QR_CODE' | 'GPS' | 'MANUAL' | 'BIOMETRIC';
  checkOutMethod?: 'QR_CODE' | 'GPS' | 'MANUAL' | 'BIOMETRIC';
  notes?: string;
  verifiedLocation?: {
    lat: number;
    lng: number;
    distanceMeters: number;
  };
}

export type LeaveType = 'EARNED' | 'HOURLY' | 'UNPAID' | 'MEDICAL';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string; // Shamsi date
  endDate: string; // Shamsi date
  startTime?: string; // for hourly leave e.g. "10:00"
  endTime?: string; // for hourly leave e.g. "12:00"
  durationDays?: number;
  durationHours?: number;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AdvanceRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  amount: number; // in Tomans
  requestDate: string; // Shamsi date
  repayMonth: string; // e.g. 1403/07
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface BonusOrPenalty {
  id: string;
  companyId: string;
  employeeId: string;
  type: 'BONUS' | 'PENALTY';
  amount: number; // Tomans
  date: string;
  month: string; // e.g. 1403/07
  title: string;
  description?: string;
}

export interface SalaryRecord {
  id: string;
  companyId: string;
  employeeId: string;
  month: string; // e.g. 1403/07 (مهر ۱۴۰۳)
  baseSalary: number;
  workDays: number;
  workedHours: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusesTotal: number;
  penaltiesTotal: number;
  advancesTotal: number;
  insuranceDeduction: number; // بیمه تأمین اجتماعی ۷٪
  taxDeduction: number; // مالیات بر درآمد
  housingAllowance: number; // حق مسکن
  groceryAllowance: number; // بن خواربار
  childAllowance: number; // حق اولاد
  grossSalary: number;
  netSalary: number; // دریافتی خالص
  status: 'DRAFT' | 'CALCULATED' | 'PAID';
  paymentDate?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string; // Shamsi date & time
  ipAddress?: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  companyCode: string;
  logoUrl?: string;
  address: string;
  phoneNumber: string;
  officeLat: number;
  officeLng: number;
  allowedGpsRadiusMeters: number;
  qrRefreshIntervalSeconds: number;
  workDaysPerMonth: number;
  insuranceRatePercent: number; // 7%
  taxRatePercent: number; // ~10%
  fixedHousingAllowance: number;
  fixedGroceryAllowance: number;
}
