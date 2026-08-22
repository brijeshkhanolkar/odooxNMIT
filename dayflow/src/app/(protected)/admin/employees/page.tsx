import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getEmploymentTypeLabel, getInitials } from '@/lib/utils';
import Link from 'next/link';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; department?: string; status?: string; type?: string }>;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from('profiles')
    .select('*, role:roles(name), department:departments(name), job_details(designation, employment_type)')
    .order('created_at', { ascending: false });

  if (params.search) {
    query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,employee_id.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  }
  if (params.department) {
    query = query.eq('department_id', params.department);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data: employees } = await query;
  const { data: departments } = await supabase.from('departments').select('*').order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <Link href="/admin/employees/new">
          <Button>+ Add Employee</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <form className="flex flex-wrap gap-4">
          <input
            name="search"
            placeholder="Search by name, ID, or email..."
            defaultValue={params.search}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <select name="department" defaultValue={params.department} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm">
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={params.status} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </Card>

      {/* Employee List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Designation</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees && employees.length > 0 ? (
                employees.map((emp: Record<string, unknown>) => {
                  const dept = emp.department as Record<string, string> | null;
                  const job = (emp.job_details as Record<string, string>[] | null)?.[0];
                  return (
                    <tr key={emp.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-semibold">
                            {emp.avatar_url ? (
                              <img src={emp.avatar_url as string} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              getInitials(emp.first_name as string, emp.last_name as string)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{emp.first_name as string} {emp.last_name as string}</p>
                            <p className="text-xs text-slate-500">{emp.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.employee_id as string}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dept?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{job?.designation || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{job ? getEmploymentTypeLabel(job.employment_type) : '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={emp.status as string} /></td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/employees/${emp.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
