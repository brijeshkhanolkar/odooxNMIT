'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { CreateEmployeeFormData } from '@/lib/types';

export async function createEmployee(formData: CreateEmployeeFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('roles:role_id(name)')
    .eq('id', user.id)
    .single();
  const roleName = (currentProfile?.roles as unknown as { name: string } | null)?.name;
  if (roleName !== 'admin') return { error: 'Administrator access required' };

  const admin = createAdminClient();

  // Check uniqueness
  const { data: existingId } = await admin
    .from('profiles')
    .select('id')
    .eq('employee_id', formData.employeeId)
    .single();
  if (existingId) return { error: 'Employee ID already exists' };

  const { data: existingEmail } = await admin
    .from('profiles')
    .select('id')
    .eq('email', formData.email)
    .single();
  if (existingEmail) return { error: 'Email already exists' };

  // Get employee role
  const { data: employeeRole } = await admin
    .from('roles')
    .select('id')
    .eq('name', 'employee')
    .single();
  if (!employeeRole) return { error: 'Employee role not found' };

  // Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      first_name: formData.firstName,
      last_name: formData.lastName,
      employee_id: formData.employeeId,
    },
  });
  if (authError) return { error: authError.message };

  // Create profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: authUser.user.id,
    employee_id: formData.employeeId,
    email: formData.email,
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone || null,
    role_id: employeeRole.id,
    department_id: formData.departmentId || null,
  });
  if (profileError) return { error: profileError.message };

  // Create job details
  const { error: jobError } = await admin.from('job_details').insert({
    profile_id: authUser.user.id,
    designation: formData.designation || null,
    joining_date: formData.joiningDate || null,
    employment_type: formData.employmentType,
  });
  if (jobError) return { error: jobError.message };

  // Create notification
  await admin.from('notifications').insert({
    profile_id: authUser.user.id,
    type: 'onboarding',
    title: 'Welcome to Dayflow!',
    message: 'Your account has been created. Start by updating your profile.',
  });

  revalidatePath('/admin/employees');
  return { success: true, userId: authUser.user.id };
}

export async function updateEmployee(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    departmentId?: string | null;
    status?: string;
    designation?: string;
    employmentType?: string;
    joiningDate?: string;
  }
) {
  const supabase = await createClient();

  // Update profile
  const profileUpdate: Record<string, unknown> = {};
  if (data.firstName) profileUpdate.first_name = data.firstName;
  if (data.lastName) profileUpdate.last_name = data.lastName;
  if (data.phone !== undefined) profileUpdate.phone = data.phone;
  if (data.address !== undefined) profileUpdate.address = data.address;
  if (data.departmentId !== undefined) profileUpdate.department_id = data.departmentId || null;
  if (data.status) profileUpdate.status = data.status;

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);
    if (error) return { error: error.message };
  }

  // Update job details
  const jobUpdate: Record<string, unknown> = {};
  if (data.designation !== undefined) jobUpdate.designation = data.designation;
  if (data.employmentType) jobUpdate.employment_type = data.employmentType;
  if (data.joiningDate) jobUpdate.joining_date = data.joiningDate;

  if (Object.keys(jobUpdate).length > 0) {
    const { error } = await supabase.from('job_details').update(jobUpdate).eq('profile_id', userId);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/employees');
  revalidatePath(`/admin/employees/${userId}`);
  return { success: true };
}

export async function toggleEmployeeStatus(userId: string, newStatus: 'active' | 'inactive') {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);
  if (error) return { error: error.message };
  revalidatePath('/admin/employees');
  return { success: true };
}

// Employee self-service: update own profile
export async function updateOwnProfile(data: { phone?: string; address?: string; avatarUrl?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const update: Record<string, unknown> = {};
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.address !== undefined) update.address = data.address;
  if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl;

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Leave actions
export async function applyLeave(data: {
  leaveType: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const currentYear = new Date(data.startDate).getFullYear();

  // Check balance
  if (data.leaveType !== 'unpaid') {
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('profile_id', user.id)
      .eq('year', currentYear)
      .single();

    if (balance) {
      if (data.leaveType === 'paid') {
        const remaining = balance.paid_allocated - balance.paid_used;
        if (data.requestedDays > remaining)
          return { error: `Insufficient paid leave balance. Remaining: ${remaining} days` };
      } else if (data.leaveType === 'sick') {
        const remaining = balance.sick_allocated - balance.sick_used;
        if (data.requestedDays > remaining)
          return { error: `Insufficient sick leave balance. Remaining: ${remaining} days` };
      }
    }
  }

  // Check overlaps
  const { data: overlapping } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('profile_id', user.id)
    .in('status', ['pending', 'approved'])
    .or(`and(start_date.lte.${data.endDate},end_date.gte.${data.startDate})`);

  if (overlapping && overlapping.length > 0) {
    return { error: 'You have overlapping leave requests for these dates' };
  }

  const { error } = await supabase.from('leave_requests').insert({
    profile_id: user.id,
    leave_type: data.leaveType,
    start_date: data.startDate,
    end_date: data.endDate,
    requested_days: data.requestedDays,
    reason: data.reason,
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/leave');
  return { success: true };
}

export async function resolveLeaveRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  comments?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: request, error: fetchError } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) return { error: 'Leave request not found' };
  if (request.status !== 'pending') return { error: 'Request is already resolved' };

  const { error } = await supabase
    .from('leave_requests')
    .update({
      status,
      admin_comments: comments || null,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) return { error: error.message };

  // Notify employee
  await supabase.from('notifications').insert({
    profile_id: request.profile_id,
    type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
    title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your ${request.leave_type} leave request from ${request.start_date} to ${request.end_date} has been ${status}.${comments ? ` Comment: ${comments}` : ''}`,
  });

  revalidatePath('/admin/leave');
  revalidatePath('/dashboard/leave');
  return { success: true };
}

// Attendance actions
export async function updateAttendanceStatus(attendanceId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('attendance')
    .update({ status })
    .eq('id', attendanceId);
  if (error) return { error: error.message };
  revalidatePath('/admin/attendance');
  return { success: true };
}

// Payroll actions
export async function updateSalaryStructure(
  profileId: string,
  data: { basicSalary: number; allowances: number; deductions: number; tax: number }
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('salary_structures')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('salary_structures')
      .update({
        basic_salary: data.basicSalary,
        allowances: data.allowances,
        deductions: data.deductions,
        tax: data.tax,
      })
      .eq('profile_id', profileId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('salary_structures').insert({
      profile_id: profileId,
      basic_salary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
      tax: data.tax,
    });
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function generatePayslips(month: number, year: number) {
  const supabase = await createClient();

  // Get all active employees with salary structures
  const { data: structures } = await supabase
    .from('salary_structures')
    .select('*, profile:profiles(id, status)')
    .not('profile', 'is', null);

  if (!structures || structures.length === 0) {
    return { error: 'No salary structures found' };
  }

  const payslips = structures
    .filter((s: Record<string, unknown>) => {
      const p = s.profile as Record<string, unknown> | null;
      return p && p.status === 'active';
    })
    .map((s: Record<string, unknown>) => {
      const basic = Number(s.basic_salary) || 0;
      const allowances = Number(s.allowances) || 0;
      const deductions = Number(s.deductions) || 0;
      const tax = Number(s.tax) || 0;
      const gross = basic + allowances;
      const net = gross - deductions - tax;

      return {
        profile_id: s.profile_id,
        month,
        year,
        basic_salary: basic,
        allowances,
        deductions,
        tax,
        gross_pay: gross,
        net_pay: net,
      };
    });

  // Upsert payslips
  const { error } = await supabase.from('payslips').upsert(payslips, {
    onConflict: 'profile_id,month,year',
  });

  if (error) return { error: error.message };

  // Notify employees
  for (const payslip of payslips) {
    await supabase.from('notifications').insert({
      profile_id: payslip.profile_id,
      type: 'payslip_generated',
      title: 'Payslip Generated',
      message: `Your payslip for ${new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })} has been generated.`,
    });
  }

  revalidatePath('/admin/payroll');
  return { success: true, count: payslips.length };
}

// Notification actions
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/notifications');
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', user.id)
    .eq('is_read', false);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/notifications');
  return { success: true };
}

// ============================================================
// Department actions
// ============================================================
export async function createDepartment(data: { name: string; description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('departments')
    .insert({ name: data.name.trim(), description: data.description?.trim() || null });
  if (error) return { error: error.message };
  revalidatePath('/admin/departments');
  return { success: true };
}

export async function updateDepartment(id: string, data: { name?: string; description?: string }) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.name) update.name = data.name.trim();
  if (data.description !== undefined) update.description = data.description.trim() || null;

  const { error } = await supabase.from('departments').update(update).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/departments');
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);
  if (count && count > 0) {
    return { error: `Cannot delete: ${count} employee(s) are assigned to this department. Reassign them first.` };
  }
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/departments');
  return { success: true };
}
