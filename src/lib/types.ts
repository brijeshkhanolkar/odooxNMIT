// ============================================================
// Dayflow HRMS — TypeScript Type Definitions
// ============================================================

export type UserRole = 'admin' | 'employee';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave';
export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType =
  | 'onboarding'
  | 'leave_submitted'
  | 'leave_approved'
  | 'leave_rejected'
  | 'checkin_reminder'
  | 'checkout_reminder'
  | 'payslip_generated';

// ============================
// Database Row Types
// ============================

export interface Role {
  id: string;
  name: UserRole;
  created_at: string;
}

export interface Profile {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  role_id: string;
  department_id: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithRole extends Profile {
  role: Role;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  created_at: string;
}

export interface JobDetail {
  id: string;
  profile_id: string;
  designation: string | null;
  joining_date: string | null;
  employment_type: EmploymentType;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  profile_id: string;
  name: string;
  file_url: string;
  type: string | null;
  uploaded_at: string;
}

export interface Attendance {
  id: string;
  profile_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number | null;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  profile_id: string;
  year: number;
  paid_allocated: number;
  paid_used: number;
  sick_allocated: number;
  sick_used: number;
  unpaid_used: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  profile_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  requested_days: number;
  reason: string | null;
  status: LeaveStatus;
  admin_comments: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructure {
  id: string;
  profile_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  profile_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  gross_pay: number;
  net_pay: number;
  pdf_url: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================
// Joined / Extended Types
// ============================

export interface EmployeeWithDetails extends Profile {
  role: Role;
  department: Department | null;
  job_details: JobDetail | null;
}

export interface LeaveRequestWithEmployee extends LeaveRequest {
  profile: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'employee_id' | 'avatar_url'>;
  resolver?: Pick<Profile, 'id' | 'first_name' | 'last_name'> | null;
}

export interface AttendanceWithEmployee extends Attendance {
  profile: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'employee_id' | 'avatar_url'>;
}

export interface PayslipWithEmployee extends Payslip {
  profile: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'employee_id'>;
}

// ============================
// Dashboard Stats
// ============================

export interface AdminDashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveApprovals: number;
  attendanceRate: number;
}

export interface EmployeeDashboardData {
  profile: ProfileWithRole;
  todayAttendance: Attendance | null;
  leaveBalance: LeaveBalance | null;
  recentLeaveRequests: LeaveRequest[];
  recentNotifications: Notification[];
}

// ============================
// Form Types
// ============================

export interface SignUpFormData {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface LeaveApplicationFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface SalaryFormData {
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
}

export interface CreateEmployeeFormData {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: string;
  designation?: string;
  joiningDate?: string;
  employmentType: EmploymentType;
  password: string;
}
