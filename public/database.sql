-- ========================================================
-- سیستم مدیریت منابع انسانی، حضور و غیاب و حقوق و دستمزد
-- پایگاه داده MySQL سازگار با phpMyAdmin و cPanel
-- نسخه: 1.0.0
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. جدول مشخصات شرکت‌ها (Multi-Tenant Support)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `address` TEXT NULL,
  `phone` VARCHAR(50) NULL,
  `office_lat` DECIMAL(10, 8) DEFAULT 35.7575,
  `office_lng` DECIMAL(11, 8) DEFAULT 51.4100,
  `allowed_gps_radius` INT DEFAULT 150,
  `qr_refresh_interval_sec` INT DEFAULT 30,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول کاربران سامانه (مدیر، مدیر واحد، پرسنل)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `company_id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `role` ENUM('ADMIN', 'MANAGER', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
  `employee_id` VARCHAR(36) NULL UNIQUE,
  `refresh_token` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول شیفت‌ها و الگوهای کاری
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `company_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('MORNING', 'EVENING', 'NIGHT', 'FLEXIBLE') DEFAULT 'MORNING',
  `start_time` VARCHAR(5) NOT NULL,
  `end_time` VARCHAR(5) NOT NULL,
  `thursday_end_time` VARCHAR(5) DEFAULT '13:00',
  `break_duration_minutes` INT DEFAULT 60,
  `late_tolerance_minutes` INT DEFAULT 15,
  `early_exit_tolerance_minutes` INT DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول کارمندان و احکام پرسنلی
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(36) PRIMARY KEY,
  `company_id` VARCHAR(36) NOT NULL,
  `personal_code` VARCHAR(50) NOT NULL UNIQUE,
  `national_code` VARCHAR(10) NOT NULL UNIQUE,
  `first_name` VARCHAR(80) NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `department` VARCHAR(80) NOT NULL,
  `position` VARCHAR(80) NOT NULL,
  `hire_date` VARCHAR(10) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'ACTIVE',
  `shift_id` VARCHAR(36) NOT NULL,
  `base_salary` BIGINT NOT NULL,
  `hourly_rate` BIGINT NOT NULL,
  `overtime_rate` DECIMAL(4, 2) DEFAULT 1.40,
  `remaining_leave_days` INT DEFAULT 20,
  `bank_account` VARCHAR(40) NULL,
  `sheba_number` VARCHAR(30) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول تردد و حضور و غیاب
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `check_in_time` VARCHAR(8) NULL,
  `check_out_time` VARCHAR(8) NULL,
  `work_duration_minutes` INT DEFAULT 0,
  `late_minutes` INT DEFAULT 0,
  `early_exit_minutes` INT DEFAULT 0,
  `overtime_minutes` INT DEFAULT 0,
  `status` ENUM('PRESENT', 'LATE', 'EARLY_LEAVE', 'ABSENT', 'ON_LEAVE', 'HOLIDAY') DEFAULT 'PRESENT',
  `check_in_method` VARCHAR(30) DEFAULT 'MANUAL',
  `check_out_method` VARCHAR(30) DEFAULT 'MANUAL',
  `verified_lat` DECIMAL(10, 8) NULL,
  `verified_lng` DECIMAL(11, 8) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_emp_date` (`employee_id`, `date`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول درخواست‌های مرخصی
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `type` ENUM('EARNED', 'HOURLY', 'UNPAID', 'MEDICAL') DEFAULT 'EARNED',
  `start_date` VARCHAR(10) NOT NULL,
  `end_date` VARCHAR(10) NOT NULL,
  `start_time` VARCHAR(8) NULL,
  `end_time` VARCHAR(8) NULL,
  `duration_days` INT NULL,
  `duration_hours` INT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `reviewed_by` VARCHAR(100) NULL,
  `reviewed_at` VARCHAR(20) NULL,
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول درخواست‌های مساعده حقوق
CREATE TABLE IF NOT EXISTS `advance_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `amount` BIGINT NOT NULL,
  `request_date` VARCHAR(10) NOT NULL,
  `repay_month` VARCHAR(7) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `reviewed_by` VARCHAR(100) NULL,
  `reviewed_at` VARCHAR(20) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. جدول فیش‌های حقوق و دستمزد
CREATE TABLE IF NOT EXISTS `salary_records` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `month` VARCHAR(7) NOT NULL,
  `base_salary` BIGINT NOT NULL,
  `work_days` INT NOT NULL,
  `worked_hours` DECIMAL(6, 2) NOT NULL,
  `overtime_hours` DECIMAL(5, 2) DEFAULT 0,
  `overtime_amount` BIGINT DEFAULT 0,
  `bonuses_total` BIGINT DEFAULT 0,
  `penalties_total` BIGINT DEFAULT 0,
  `advances_total` BIGINT DEFAULT 0,
  `insurance_deduction` BIGINT NOT NULL,
  `tax_deduction` BIGINT NOT NULL,
  `housing_allowance` BIGINT DEFAULT 900000,
  `grocery_allowance` BIGINT DEFAULT 1400000,
  `gross_salary` BIGINT NOT NULL,
  `net_salary` BIGINT NOT NULL,
  `status` ENUM('DRAFT', 'CALCULATED', 'PAID') DEFAULT 'DRAFT',
  `payment_date` VARCHAR(10) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_emp_month` (`employee_id`, `month`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. جدول ثبت لاگ‌های امنیتی (Audit Logs)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `company_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(80) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- داده‌های نمونه اولیه (Seed Data)
-- ========================================================

INSERT INTO `companies` (`id`, `name`, `code`, `address`, `phone`, `office_lat`, `office_lng`, `allowed_gps_radius`, `qr_refresh_interval_sec`)
VALUES ('comp_iran_tech_01', 'شرکت مهندسی فناوران ایده نوین', 'COMP-1084', 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگین', '۰۲۱-۸۸۸۸۱۹۲۰', 35.7575, 51.4100, 150, 30)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `shifts` (`id`, `company_id`, `name`, `type`, `start_time`, `end_time`, `thursday_end_time`, `break_duration_minutes`, `late_tolerance_minutes`, `early_exit_tolerance_minutes`)
VALUES
('shift_standard_day', 'comp_iran_tech_01', 'شیفت استاندارد اداری', 'MORNING', '08:00', '17:00', '13:00', 60, 15, 10),
('shift_evening_support', 'comp_iran_tech_01', 'شیفت عصر (پشتیبانی فنی)', 'EVENING', '15:30', '23:30', '23:30', 45, 10, 10)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `employees` (`id`, `company_id`, `personal_code`, `national_code`, `first_name`, `last_name`, `phone`, `email`, `department`, `position`, `hire_date`, `status`, `shift_id`, `base_salary`, `hourly_rate`, `remaining_leave_days`)
VALUES
('emp_01', 'comp_iran_tech_01', 'EMP-1001', '0018349501', 'علیرضا', 'صادقی', '09121111111', 'a.sadeghi@novintech.ir', 'فناوری و مهندسی', 'مدیر ارشد فنی (CTO)', '1400/01/15', 'ACTIVE', 'shift_standard_day', 42000000, 238000, 19),
('emp_02', 'comp_iran_tech_01', 'EMP-1002', '0029485712', 'سارا', 'احمدی', '09122222222', 's.ahmadi@novintech.ir', 'منابع انسانی و مالی', 'مدیر منابع انسانی', '1401/03/10', 'ACTIVE', 'shift_standard_day', 35000000, 198000, 21),
('emp_03', 'comp_iran_tech_01', 'EMP-1003', '0038572910', 'علی', 'کریمی', '09123333333', 'a.karimi@novintech.ir', 'فناوری و مهندسی', 'توسعه‌دهنده فول‌استک ارشد', '1401/07/01', 'ACTIVE', 'shift_standard_day', 38000000, 215000, 15)
ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);

SET FOREIGN_KEY_CHECKS = 1;
