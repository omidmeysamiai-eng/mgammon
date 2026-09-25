import {
  CompanySettings,
  Shift,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  AdvanceRequest,
  SalaryRecord,
  AuditLog,
  User,
  BonusOrPenalty,
  RequestStatus,
  BroadcastMessage
} from '../types';
import {
  initialCompanySettings,
  initialShifts,
  initialEmployees,
  initialAttendanceRecords,
  initialLeaveRequests,
  initialAdvanceRequests,
  initialSalaryRecords,
  initialAuditLogs,
  initialUsers,
  initialBonusesPenalties,
  initialBroadcastMessages
} from '../data/initialData';
import { getCurrentTimeStr, getTodayShamsi, calculateGpsDistanceMeters } from '../utils/dateUtils';

const STORAGE_KEYS = {
  SETTINGS: 'mgommon_company_settings_v2',
  SHIFTS: 'mgommon_shifts_v2',
  EMPLOYEES: 'mgommon_employees_v2',
  ATTENDANCE: 'mgommon_attendance_v2',
  LEAVES: 'mgommon_leaves_v2',
  ADVANCES: 'mgommon_advances_v2',
  SALARIES: 'mgommon_salaries_v2',
  AUDIT_LOGS: 'mgommon_audit_logs_v2',
  USERS: 'mgommon_users_v2',
  BONUSES: 'mgommon_bonuses_v2',
  MESSAGES: 'mgommon_messages_v2',
  CURRENT_USER: 'mgommon_current_user_v2',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export class StorageService {
  // Aliases for leaves and advances
  static saveLeaves(leaves: LeaveRequest[]): void {
    this.saveLeaveRequests(leaves);
  }

  static saveAdvances(advances: AdvanceRequest[]): void {
    this.saveAdvanceRequests(advances);
  }

  // Current logged in / simulated user
  static getCurrentUser(): User {
    const users = this.getUsers();
    const saved = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved && users.some(u => u.id === saved.id)) {
      return saved;
    }
    return users[0]; // Admin by default
  }

  static setCurrentUser(user: User): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog('تغییر کاربر فعال', 'سیستم', `ورود به حساب کاربری: ${user.name} (${user.role})`);
  }

  // Users
  static getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  static saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  }

  // Company Settings
  static getSettings(): CompanySettings {
    return getItem<CompanySettings>(STORAGE_KEYS.SETTINGS, initialCompanySettings);
  }

  static saveSettings(settings: CompanySettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog('بروزرسانی تنظیمات شرکت', 'تنظیمات پایه', 'تغییر پارامترهای شرکت، محدوده جغرافیایی یا ضرایب بیمه و مالیات');
  }

  // Shifts
  static getShifts(): Shift[] {
    return getItem<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts);
  }

  static saveShifts(shifts: Shift[]): void {
    setItem(STORAGE_KEYS.SHIFTS, shifts);
  }

  static addShift(shift: Shift): void {
    const list = this.getShifts();
    list.push(shift);
    this.saveShifts(list);
    this.addAuditLog('ایجاد شیفت جدید', 'برنامه کاری', `شیفت ${shift.name} تعریف گردید.`);
  }

  static updateShift(shift: Shift): void {
    const list = this.getShifts().map(s => s.id === shift.id ? shift : s);
    this.saveShifts(list);
    this.addAuditLog('ویرایش شیفت کاری', 'برنامه کاری', `شیفت ${shift.name} بروزرسانی گردید.`);
  }

  static deleteShift(id: string): void {
    const list = this.getShifts().filter(s => s.id !== id);
    this.saveShifts(list);
    this.addAuditLog('حذف شیفت کاری', 'برنامه کاری', `شناسه شیفت: ${id}`);
  }

  // Employees
  static getEmployees(): Employee[] {
    return getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees);
  }

  static saveEmployees(employees: Employee[]): void {
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
  }

  static addEmployee(emp: Employee): void {
    const list = this.getEmployees();
    list.unshift(emp);
    this.saveEmployees(list);

    // Automatically create employee user credentials & portal access
    const users = this.getUsers();
    const username = emp.username || (emp.nationalCode ? `emp_${emp.nationalCode.slice(-4)}` : `user_${emp.personalCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    const newUser: User = {
      id: `usr_${emp.id}`,
      companyId: emp.companyId || 'comp_mgommon_01',
      employeeId: emp.id,
      username: username,
      password: emp.password || '123456',
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email || `${username}@mgommon.ir`,
      phone: emp.phone,
      role: 'EMPLOYEE',
      workshopId: emp.workshopId || 'ws_1',
      avatarUrl: emp.avatarUrl
    };

    if (!users.some(u => u.username === username || u.employeeId === emp.id)) {
      users.push(newUser);
      this.saveUsers(users);
    }

    this.addAuditLog('استخدام و ایجاد پرتال پرسنل', 'کارکنان', `پرسنل ${emp.firstName} ${emp.lastName} با دسترسی پرتال کاربری ایجاد شد.`);
  }

  static updateEmployee(emp: Employee): void {
    const list = this.getEmployees().map(e => e.id === emp.id ? emp : e);
    this.saveEmployees(list);

    // Also update associated user if present
    const users = this.getUsers().map(u => {
      if (u.employeeId === emp.id) {
        return {
          ...u,
          name: `${emp.firstName} ${emp.lastName}`,
          phone: emp.phone,
          email: emp.email || u.email,
          workshopId: emp.workshopId || u.workshopId,
          avatarUrl: emp.avatarUrl || u.avatarUrl,
        };
      }
      return u;
    });
    this.saveUsers(users);

    this.addAuditLog('ویرایش اطلاعات پرسنل', 'کارکنان', `اطلاعات ${emp.firstName} ${emp.lastName} اصلاح شد.`);
  }

  static deleteEmployee(id: string): void {
    const target = this.getEmployees().find(e => e.id === id);
    const list = this.getEmployees().filter(e => e.id !== id);
    this.saveEmployees(list);

    // Remove user account
    const users = this.getUsers().filter(u => u.employeeId !== id);
    this.saveUsers(users);

    if (target) {
      this.addAuditLog('حذف پرونده کارمند', 'کارکنان', `کارمند ${target.firstName} ${target.lastName} از سیستم حذف شد.`);
    }
  }

  // Attendance
  static getAttendance(): AttendanceRecord[] {
    return getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, initialAttendanceRecords);
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    setItem(STORAGE_KEYS.ATTENDANCE, records);
  }

  // Clock In
  static clockIn(
    employeeId: string,
    method: 'QR_CODE' | 'GPS' | 'MANUAL' = 'QR_CODE',
    gpsCoords?: { lat: number; lng: number }
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const today = getTodayShamsi();
    const timeNow = getCurrentTimeStr();
    const settings = this.getSettings();
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, message: 'کارمند یافت نشد.' };

    const shifts = this.getShifts();
    const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];

    // Check GPS validation if coords provided against workshops (strictly 20m radius)
    let verifiedLocation;
    if (gpsCoords) {
      const workshops = settings.workshops || [];
      let minDistance = 999999;
      let matchedWorkshopName = 'کارگاه';

      if (workshops.length > 0) {
        workshops.forEach(ws => {
          const dist = calculateGpsDistanceMeters(gpsCoords.lat, gpsCoords.lng, ws.lat, ws.lng);
          if (dist < minDistance) {
            minDistance = dist;
            matchedWorkshopName = ws.name;
          }
        });
      } else {
        minDistance = calculateGpsDistanceMeters(
          gpsCoords.lat,
          gpsCoords.lng,
          settings.officeLat,
          settings.officeLng
        );
      }

      const maxAllowed = settings.allowedGpsRadiusMeters || 20;
      const roundedDistance = Math.round(minDistance);

      if (roundedDistance > maxAllowed) {
        return {
          success: false,
          message: `فاصله فعلی شما (${roundedDistance} متر) خارج از محدوده مجاز ${matchedWorkshopName} (حداکثر ${maxAllowed} متر) است.`
        };
      }
      verifiedLocation = { lat: gpsCoords.lat, lng: gpsCoords.lng, distanceMeters: roundedDistance };
    }

    const records = this.getAttendance();
    const existing = records.find(r => r.employeeId === employeeId && r.date === today);

    if (existing && existing.checkInTime) {
      return { success: false, message: `شما قبلاً در ساعت ${existing.checkInTime} ورود خود را ثبت کرده‌اید.` };
    }

    // Calculate late minutes
    // shift.startTime is e.g. "08:00", tolerance is shift.lateToleranceMinutes
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [curH, curM] = timeNow.split(':').map(Number);
    const scheduledStartMinutes = startH * 60 + startM;
    const actualArrivalMinutes = curH * 60 + curM;

    let lateMinutes = 0;
    let status: AttendanceRecord['status'] = 'PRESENT';
    if (actualArrivalMinutes > scheduledStartMinutes + shift.lateToleranceMinutes) {
      lateMinutes = actualArrivalMinutes - scheduledStartMinutes;
      status = 'LATE';
    }

    const newRecord: AttendanceRecord = existing
      ? {
          ...existing,
          checkInTime: timeNow,
          status,
          lateMinutes,
          checkInMethod: method,
          verifiedLocation,
        }
      : {
          id: `att_${Date.now()}`,
          companyId: settings.id,
          employeeId,
          date: today,
          checkInTime: timeNow,
          checkOutTime: '',
          workDurationMinutes: 0,
          lateMinutes,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
          status,
          checkInMethod: method,
          verifiedLocation,
        };

    const updatedRecords = existing
      ? records.map(r => r.id === existing.id ? newRecord : r)
      : [newRecord, ...records];

    this.saveAttendance(updatedRecords);
    this.addAuditLog(
      'ثبت ورود پرسنل',
      'حضور و غیاب',
      `ثبت ورود ${emp.firstName} ${emp.lastName} در ساعت ${timeNow} از طریق ${method}`
    );

    return {
      success: true,
      message: lateMinutes > 0
        ? `ورود در ساعت ${timeNow} ثبت شد. (با ${lateMinutes} دقیقه تأخیر)`
        : `ورود شما در ساعت ${timeNow} با موفقیت و در زمان مقرر ثبت گردید.`,
      record: newRecord
    };
  }

  // Clock Out
  static clockOut(
    employeeId: string,
    method: 'QR_CODE' | 'GPS' | 'MANUAL' = 'QR_CODE',
    gpsCoords?: { lat: number; lng: number }
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const today = getTodayShamsi();
    const timeNow = getCurrentTimeStr();
    const settings = this.getSettings();
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, message: 'کارمند یافت نشد.' };

    const records = this.getAttendance();
    const existing = records.find(r => r.employeeId === employeeId && r.date === today);

    if (!existing || !existing.checkInTime) {
      return { success: false, message: 'ابتدا باید ورود خود را ثبت نمایید.' };
    }

    if (existing.checkOutTime) {
      return { success: false, message: `خروج شما قبلاً در ساعت ${existing.checkOutTime} ثبت شده است.` };
    }

    // Check GPS validation if coords provided against workshops (strictly 20m radius)
    if (gpsCoords) {
      const workshops = settings.workshops || [];
      let minDistance = 999999;
      let matchedWorkshopName = 'کارگاه';

      if (workshops.length > 0) {
        workshops.forEach(ws => {
          const dist = calculateGpsDistanceMeters(gpsCoords.lat, gpsCoords.lng, ws.lat, ws.lng);
          if (dist < minDistance) {
            minDistance = dist;
            matchedWorkshopName = ws.name;
          }
        });
      } else {
        minDistance = calculateGpsDistanceMeters(
          gpsCoords.lat,
          gpsCoords.lng,
          settings.officeLat,
          settings.officeLng
        );
      }

      const maxAllowed = settings.allowedGpsRadiusMeters || 20;
      const roundedDistance = Math.round(minDistance);

      if (roundedDistance > maxAllowed) {
        return {
          success: false,
          message: `فاصله فعلی شما (${roundedDistance} متر) خارج از محدوده مجاز ${matchedWorkshopName} (حداکثر ${maxAllowed} متر) است.`
        };
      }
    }

    const shifts = this.getShifts();
    const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];

    // Calculate work duration
    const [inH, inM] = existing.checkInTime.split(':').map(Number);
    const [outH, outM] = timeNow.split(':').map(Number);
    const inTotalMins = inH * 60 + inM;
    const outTotalMins = outH * 60 + outM;
    const rawWorkedMins = Math.max(0, outTotalMins - inTotalMins);
    const netWorkedMins = Math.max(0, rawWorkedMins - shift.breakDurationMinutes);

    // Calculate early exit or overtime
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const scheduledEndMinutes = endH * 60 + endM;

    let earlyExitMinutes = 0;
    let overtimeMinutes = 0;

    if (outTotalMins < scheduledEndMinutes - shift.earlyExitToleranceMinutes) {
      earlyExitMinutes = scheduledEndMinutes - outTotalMins;
    } else if (outTotalMins > scheduledEndMinutes) {
      overtimeMinutes = outTotalMins - scheduledEndMinutes;
    }

    const updatedRecord: AttendanceRecord = {
      ...existing,
      checkOutTime: timeNow,
      workDurationMinutes: netWorkedMins,
      earlyExitMinutes,
      overtimeMinutes,
      checkOutMethod: method,
    };

    const updatedList = records.map(r => r.id === existing.id ? updatedRecord : r);
    this.saveAttendance(updatedList);
    this.addAuditLog(
      'ثبت خروج پرسنل',
      'حضور و غیاب',
      `ثبت خروج ${emp.firstName} ${emp.lastName} در ساعت ${timeNow} (مدت کارکرد: ${Math.round(netWorkedMins / 60)} ساعت)`
    );

    return {
      success: true,
      message: overtimeMinutes > 0
        ? `خروج در ساعت ${timeNow} ثبت شد. (${overtimeMinutes} دقیقه اضافه‌کاری محاسبه شد)`
        : `خروج در ساعت ${timeNow} با موفقیت ثبت گردید.`,
      record: updatedRecord
    };
  }

  // Leave Requests
  static getLeaveRequests(): LeaveRequest[] {
    return getItem<LeaveRequest[]>(STORAGE_KEYS.LEAVES, initialLeaveRequests);
  }

  static getLeaves(): LeaveRequest[] {
    return this.getLeaveRequests();
  }

  static saveLeaveRequests(leaves: LeaveRequest[]): void {
    setItem(STORAGE_KEYS.LEAVES, leaves);
  }

  static submitLeaveRequest(req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'companyId'>): void {
    const list = this.getLeaveRequests();
    const settings = this.getSettings();
    const today = getTodayShamsi();
    const time = getCurrentTimeStr();
    const newReq: LeaveRequest = {
      ...req,
      id: `leave_${Date.now()}`,
      companyId: settings.id,
      status: 'PENDING',
      createdAt: `${today} - ${time}`,
    };
    list.unshift(newReq);
    this.saveLeaveRequests(list);
    this.addAuditLog('ثبت درخواست مرخصی', 'مرخصی', `درخواست جدید توسط ${req.employeeName}`);
  }

  static reviewLeaveRequest(id: string, approved: boolean, reviewerName: string, rejectionReason?: string): void {
    const leaves = this.getLeaveRequests();
    const today = getTodayShamsi();
    const time = getCurrentTimeStr();

    let targetReq: LeaveRequest | undefined;
    const updated = leaves.map(l => {
      if (l.id === id) {
        targetReq = l;
        return {
          ...l,
          status: (approved ? 'APPROVED' : 'REJECTED') as RequestStatus,
          reviewedBy: reviewerName,
          reviewedAt: `${today} - ${time}`,
          rejectionReason: approved ? undefined : rejectionReason,
        };
      }
      return l;
    });

    this.saveLeaveRequests(updated);

    if (targetReq && approved) {
      // Deduct from employee leave balance if earned
      if (targetReq.type === 'EARNED' && targetReq.durationDays) {
        const emps = this.getEmployees().map(e => {
          if (e.id === targetReq?.employeeId) {
            return {
              ...e,
              remainingLeaveDays: Math.max(0, e.remainingLeaveDays - (targetReq?.durationDays || 1))
            };
          }
          return e;
        });
        this.saveEmployees(emps);
      }

      // Automatically update attendance record for today if the leave covers today
      if (targetReq.startDate <= today && targetReq.endDate >= today) {
        const attRecords = this.getAttendance();
        const existing = attRecords.find(a => a.employeeId === targetReq?.employeeId && a.date === today);
        if (existing) {
          const updatedAtt = attRecords.map(a => a.id === existing.id ? { ...a, status: 'ON_LEAVE' as const, notes: 'مرخصی تایید شده' } : a);
          this.saveAttendance(updatedAtt);
        } else {
          attRecords.unshift({
            id: `att_${Date.now()}`,
            companyId: targetReq.companyId,
            employeeId: targetReq.employeeId,
            date: today,
            workDurationMinutes: 0,
            lateMinutes: 0,
            earlyExitMinutes: 0,
            overtimeMinutes: 0,
            status: 'ON_LEAVE',
            notes: 'مرخصی تایید شده'
          });
          this.saveAttendance(attRecords);
        }
      }
    }

    this.addAuditLog(
      approved ? 'تأیید درخواست مرخصی' : 'رد درخواست مرخصی',
      'مرخصی',
      `درخواست مرخصی ${targetReq?.employeeName} توسط ${reviewerName} ${approved ? 'تأیید شد' : 'رد شد'}`
    );
  }

  // Advance Requests (مساعده)
  static getAdvanceRequests(): AdvanceRequest[] {
    return getItem<AdvanceRequest[]>(STORAGE_KEYS.ADVANCES, initialAdvanceRequests);
  }

  static getAdvances(): AdvanceRequest[] {
    return this.getAdvanceRequests();
  }

  static saveAdvanceRequests(reqs: AdvanceRequest[]): void {
    setItem(STORAGE_KEYS.ADVANCES, reqs);
  }

  static submitAdvanceRequest(req: Omit<AdvanceRequest, 'id' | 'createdAt' | 'status' | 'companyId'>): void {
    const list = this.getAdvanceRequests();
    const settings = this.getSettings();
    const today = getTodayShamsi();
    const time = getCurrentTimeStr();
    const newReq: AdvanceRequest = {
      ...req,
      id: `adv_${Date.now()}`,
      companyId: settings.id,
      status: 'PENDING',
      createdAt: `${today} - ${time}`,
    };
    list.unshift(newReq);
    this.saveAdvanceRequests(list);
    this.addAuditLog('درخواست مساعده حقوق', 'مساعده', `درخواست مبلغ ${req.amount} تومان توسط ${req.employeeName}`);
  }

  static reviewAdvanceRequest(id: string, approved: boolean, reviewerName: string, rejectionReason?: string): void {
    const reqs = this.getAdvanceRequests();
    const today = getTodayShamsi();
    const time = getCurrentTimeStr();

    let targetReq: AdvanceRequest | undefined;
    const updated = reqs.map(r => {
      if (r.id === id) {
        targetReq = r;
        return {
          ...r,
          status: (approved ? 'APPROVED' : 'REJECTED') as RequestStatus,
          reviewedBy: reviewerName,
          reviewedAt: `${today} - ${time}`,
          rejectionReason: approved ? undefined : rejectionReason,
        };
      }
      return r;
    });

    this.saveAdvanceRequests(updated);

    this.addAuditLog(
      approved ? 'موافقت با مساعده' : 'رد درخواست مساعده',
      'مساعده مالی',
      `مساعده ${targetReq?.employeeName} به مبلغ ${targetReq?.amount} تومان ${approved ? 'تأیید شد' : 'رد شد'}`
    );
  }

  // Bonuses & Penalties
  static getBonusesAndPenalties(): BonusOrPenalty[] {
    return getItem<BonusOrPenalty[]>(STORAGE_KEYS.BONUSES, initialBonusesPenalties);
  }

  static saveBonusesAndPenalties(list: BonusOrPenalty[]): void {
    setItem(STORAGE_KEYS.BONUSES, list);
  }

  static addBonusOrPenalty(item: BonusOrPenalty): void {
    const list = this.getBonusesAndPenalties();
    list.unshift(item);
    this.saveBonusesAndPenalties(list);
    this.addAuditLog(
      item.type === 'BONUS' ? 'ثبت پاداش پرسنل' : 'ثبت جریمه پرسنل',
      'حقوق و دستمزد',
      `${item.title} به مبلغ ${item.amount} تومان`
    );
  }

  // Salaries & Payroll Engine
  static getSalaries(): SalaryRecord[] {
    return getItem<SalaryRecord[]>(STORAGE_KEYS.SALARIES, initialSalaryRecords);
  }

  static saveSalaries(salaries: SalaryRecord[]): void {
    setItem(STORAGE_KEYS.SALARIES, salaries);
  }

  // Automatic Payroll Calculation Engine for given employee and month
  static calculateSalaryForEmployee(employeeId: string, month: string): SalaryRecord {
    const settings = this.getSettings();
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === employeeId) || employees[0];
    const attendance = this.getAttendance();
    const advances = this.getAdvanceRequests();
    const bonusesPenalties = this.getBonusesAndPenalties();

    // Calculate total worked hours and overtime from attendance
    let totalOvertimeMins = 0;
    let workedDaysCount = 0;
    let totalWorkedMinutes = 0;

    attendance
      .filter(a => a.employeeId === employeeId && a.date.startsWith(month))
      .forEach(a => {
        if (a.status === 'PRESENT' || a.status === 'LATE') {
          workedDaysCount++;
          totalWorkedMinutes += (a.workDurationMinutes || 480);
          totalOvertimeMins += (a.overtimeMinutes || 0);
        }
      });

    // If no records for month yet, assume standard month workdays
    if (workedDaysCount === 0) {
      workedDaysCount = settings.workDaysPerMonth;
      totalWorkedMinutes = workedDaysCount * 8 * 60;
    }

    const workedHours = Math.round(totalWorkedMinutes / 60);
    const overtimeHours = Math.round(totalOvertimeMins / 60);
    const overtimeAmount = Math.round(overtimeHours * emp.hourlyRate * emp.overtimeRate);

    // Sum approved advances for this repay month
    const approvedAdvances = advances
      .filter(a => a.employeeId === employeeId && a.status === 'APPROVED' && a.repayMonth === month)
      .reduce((sum, a) => sum + a.amount, 0);

    // Sum bonuses and penalties
    const bonuses = bonusesPenalties
      .filter(b => b.employeeId === employeeId && b.type === 'BONUS' && b.month === month)
      .reduce((sum, b) => sum + b.amount, 0);

    const penalties = bonusesPenalties
      .filter(b => b.employeeId === employeeId && b.type === 'PENALTY' && b.month === month)
      .reduce((sum, b) => sum + b.amount, 0);

    // Allowances
    const housing = settings.fixedHousingAllowance;
    const grocery = settings.fixedGroceryAllowance;
    const child = 0; // standard single

    // Gross Salary = Base + Overtime + Bonuses + Allowances
    const grossSalary = emp.baseSalary + overtimeAmount + bonuses + housing + grocery + child;

    // Deductions
    const insuranceDeduction = Math.round((emp.baseSalary + housing + grocery) * (settings.insuranceRatePercent / 100));
    // Tax: progressive or flat 10% on taxable portion above 12,000,000 Toman threshold
    const taxableBase = Math.max(0, grossSalary - 14000000);
    const taxDeduction = Math.round(taxableBase * (settings.taxRatePercent / 100));

    // Net Salary = Gross - Insurance - Tax - Penalties - Advances
    const netSalary = Math.max(0, grossSalary - insuranceDeduction - taxDeduction - penalties - approvedAdvances);

    const record: SalaryRecord = {
      id: `sal_${emp.id}_${month.replace('/', '_')}`,
      companyId: settings.id,
      employeeId: emp.id,
      month,
      baseSalary: emp.baseSalary,
      workDays: workedDaysCount,
      workedHours,
      overtimeHours,
      overtimeAmount,
      bonusesTotal: bonuses,
      penaltiesTotal: penalties,
      advancesTotal: approvedAdvances,
      housingAllowance: housing,
      groceryAllowance: grocery,
      childAllowance: child,
      grossSalary,
      insuranceDeduction,
      taxDeduction,
      netSalary,
      status: 'CALCULATED',
    };

    // Save or update in list
    const salaries = this.getSalaries();
    const idx = salaries.findIndex(s => s.employeeId === employeeId && s.month === month);
    if (idx >= 0) {
      salaries[idx] = record;
    } else {
      salaries.unshift(record);
    }
    this.saveSalaries(salaries);

    return record;
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  static addAuditLog(action: string, resource: string, details: string): void {
    const list = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const today = getTodayShamsi();
    const time = getCurrentTimeStr();

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      companyId: currentUser.companyId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      resource,
      details,
      timestamp: `${today} - ${time}`,
      ipAddress: '192.168.1.100'
    };

    list.unshift(newLog);
    // keep latest 100 logs
    setItem(STORAGE_KEYS.AUDIT_LOGS, list.slice(0, 100));
  }

  // Broadcast Messages & SMS Panel
  static getMessages(): BroadcastMessage[] {
    return getItem<BroadcastMessage[]>(STORAGE_KEYS.MESSAGES, initialBroadcastMessages);
  }

  static saveMessages(messages: BroadcastMessage[]): void {
    setItem(STORAGE_KEYS.MESSAGES, messages);
  }

  static addMessage(msg: BroadcastMessage): void {
    const list = this.getMessages();
    list.unshift(msg);
    this.saveMessages(list);
    this.addAuditLog('ارسال پیام / پیامک', 'پیام‌رسانی و پیامک', `ارسال اطلاعیه «${msg.title}» به ${msg.recipientType === 'ALL' ? 'همه کارکنان' : msg.recipientType} از طریق کانال ${msg.channel}`);
  }

  static deleteMessage(id: string): void {
    const list = this.getMessages().filter(m => m.id !== id);
    this.saveMessages(list);
    this.addAuditLog('حذف پیام', 'پیام‌رسانی و پیامک', `شناسه پیام: ${id}`);
  }

  // Reset demo data to defaults
  static resetToDefaults(): void {
    Object.values(STORAGE_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.error(e);
      }
    });
    this.saveSettings(initialCompanySettings);
    this.saveShifts(initialShifts);
    this.saveEmployees(initialEmployees);
    this.saveAttendance(initialAttendanceRecords);
    this.saveLeaves(initialLeaveRequests);
    this.saveAdvances(initialAdvanceRequests);
    this.saveSalaries(initialSalaryRecords);
    this.saveUsers(initialUsers);
    this.saveMessages(initialBroadcastMessages);
    this.setCurrentUser(initialUsers[0]);
  }
}
