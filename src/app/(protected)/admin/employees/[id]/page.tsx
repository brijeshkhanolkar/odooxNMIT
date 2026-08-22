import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatHours, formatTime, getEmploymentTypeLabel, getInitials } from '@/lib/utils';
import { EmployeeEditor } from '@/components/employees/employee-editor';
import { StatusToggleButton } from '@/components/employees/status-toggle-button';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();

  const [profileResult, jobResult, balanceResult, attendanceResult, leaveResult, salaryResult, documentsResult, departmentsResult] = await Promise.all([
    supabase.from('profiles').select('*, role:roles(name), department:departments(name)').eq('id', id).single(),
    supabase.from('job_details').select('*').eq('profile_id', id).maybeSingle(),
    supabase.from('leave_balances').select('*').eq('profile_id', id).eq('year', currentYear).maybeSingle(),
    supabase.from('attendance').select('*').eq('profile_id', id).order('date', { ascending: false }).limit(7),
    supabase.from('leave_requests').select('*').eq('profile_id', id).order('created_at', { ascending: false }).limit(5),
    supabase.from('salary_structures').select('*').eq('profile_id', id).maybeSingle(),
    supabase.from('documents').select('*').eq('profile_id', id).order('uploaded_at', { ascending: false }),
    supabase.from('departments').select('id, name').order('name'),
  ]);

  if (profileResult.error || !profileResult.data) notFound();

  const profile = profileResult.data as Record<string, unknown>;
  const job = jobResult.data as Record<string, unknown> | null;
  const balance = balanceResult.data as Record<string, number> | null;
  const salary = salaryResult.data as Record<string, number> | null;
  const departments = (departmentsResult.data ?? []) as { id: string; name: string }[];
  const role = profile.role as unknown as { name?: string } | null;
  const department = profile.department as unknown as { name?: string } | null;
  const firstName = profile.first_name as string;
  const lastName = profile.last_name as string;
  const grossPay = salary ? Number(salary.basic_salary) + Number(salary.allowances) : 0;
  const netPay = salary ? grossPay - Number(salary.deductions) - Number(salary.tax) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees" className="text-sm font-medium text-violet-600 hover:text-violet-700">← Employees</Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee details</h1>
            <p className="text-sm text-slate-500">Employee ID: {profile.employee_id as string}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={profile.status as string} />
          <EmployeeEditor
            userId={id}
            initialData={{
              firstName,
              lastName,
              phone: (profile.phone as string) || '',
              address: (profile.address as string) || '',
              departmentId: (profile.department_id as string) || null,
              designation: (job?.designation as string) || '',
              employmentType: (job?.employment_type as string) || 'full_time',
              status: profile.status as string,
            }}
            departments={departments}
          />
          <StatusToggleButton userId={id} currentStatus={profile.status as string} />
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
            {profile.avatar_url ? <img src={profile.avatar_url as string} alt="" className="h-full w-full object-cover" /> : getInitials(firstName, lastName)}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <div><p className="text-lg font-semibold text-slate-900">{firstName} {lastName}</p><p className="text-sm text-slate-500">{profile.email as string}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Designation</p><p className="mt-1 text-sm font-medium text-slate-700">{job?.designation as string || 'Not assigned'}</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Department</p><p className="mt-1 text-sm font-medium text-slate-700">{department?.name || 'Not assigned'}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Personal information</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Phone" value={profile.phone as string || 'Not provided'} />
            <Detail label="Address" value={profile.address as string || 'Not provided'} />
            <Detail label="Role" value={role?.name === 'admin' ? 'Admin / HR' : 'Employee'} />
            <Detail label="Joined" value={job?.joining_date ? formatDate(job.joining_date as string) : 'Not provided'} />
            <Detail label="Employment type" value={job?.employment_type ? getEmploymentTypeLabel(job.employment_type as string) : 'Not assigned'} />
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Leave balance - {currentYear}</h2>
          {balance ? (
            <div className="grid grid-cols-3 gap-3">
              <Balance label="Paid" value={balance.paid_allocated - balance.paid_used} />
              <Balance label="Sick" value={balance.sick_allocated - balance.sick_used} />
              <Balance label="Unpaid" value={balance.unpaid_used} suffix="used" />
            </div>
          ) : <p className="text-sm text-slate-500">No leave balance has been created for this employee.</p>}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-semibold text-slate-900">Recent attendance</h2></div>
          {attendanceResult.data && attendanceResult.data.length > 0 ? (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">In</th><th className="px-6 py-3">Out</th><th className="px-6 py-3">Hours</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{attendanceResult.data.map((entry) => <tr key={entry.id}><td className="px-6 py-3">{formatDate(entry.date)}</td><td className="px-6 py-3">{entry.check_in ? formatTime(entry.check_in) : '—'}</td><td className="px-6 py-3">{entry.check_out ? formatTime(entry.check_out) : '—'}</td><td className="px-6 py-3">{formatHours(Number(entry.work_hours))}</td><td className="px-6 py-3"><StatusBadge status={entry.status} /></td></tr>)}</tbody></table></div>
          ) : <p className="px-6 py-10 text-center text-sm text-slate-500">No attendance records yet.</p>}
        </Card>

        <Card padding="none">
          <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-semibold text-slate-900">Recent leave requests</h2></div>
          {leaveResult.data && leaveResult.data.length > 0 ? (
            <div className="divide-y divide-slate-100">{leaveResult.data.map((request) => <div key={request.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="text-sm font-medium capitalize text-slate-900">{request.leave_type} leave</p><p className="text-xs text-slate-500">{formatDate(request.start_date)} - {formatDate(request.end_date)} · {request.requested_days} day(s)</p></div><StatusBadge status={request.status} /></div>)}</div>
          ) : <p className="px-6 py-10 text-center text-sm text-slate-500">No leave requests yet.</p>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Salary structure</h2>
          {salary ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3"><Detail label="Basic" value={formatCurrency(Number(salary.basic_salary))} /><Detail label="Allowances" value={formatCurrency(Number(salary.allowances))} /><Detail label="Deductions" value={formatCurrency(Number(salary.deductions))} /><Detail label="Tax" value={formatCurrency(Number(salary.tax))} /><Detail label="Gross pay" value={formatCurrency(grossPay)} /><Detail label="Net pay" value={formatCurrency(netPay)} /></div> : <p className="text-sm text-slate-500">No salary structure has been created for this employee.</p>}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Documents</h2>
          {documentsResult.data && documentsResult.data.length > 0 ? <ul className="space-y-3">{documentsResult.data.map((document) => <li key={document.id}><a href={document.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-violet-600 hover:text-violet-700">{document.name}</a><p className="text-xs text-slate-500">Uploaded {formatDate(document.uploaded_at)}</p></li>)}</ul> : <p className="text-sm text-slate-500">No documents have been uploaded.</p>}
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd></div>;
}

function Balance({ label, value, suffix = 'remaining' }: { label: string; value: number; suffix?: string }) {
  return <div className="rounded-lg bg-violet-50 p-3"><p className="text-xs font-medium text-violet-700">{label}</p><p className="mt-1 text-lg font-bold text-violet-900">{value}</p><p className="text-xs text-violet-600">{suffix}</p></div>;
}
