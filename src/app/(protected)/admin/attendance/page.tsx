import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, formatTime, formatHours, getInitials } from '@/lib/utils';

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; date?: string; status?: string }>;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from('attendance')
    .select('*, profile:profiles(first_name, last_name, employee_id, avatar_url)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.date) {
    query = query.eq('date', params.date);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data: records } = await query;

  // Filter by search if provided
  const filteredRecords = params.search
    ? records?.filter((r: Record<string, unknown>) => {
        const p = r.profile as Record<string, string> | null;
        if (!p) return false;
        const search = params.search!.toLowerCase();
        return (
          p.first_name?.toLowerCase().includes(search) ||
          p.last_name?.toLowerCase().includes(search) ||
          p.employee_id?.toLowerCase().includes(search)
        );
      })
    : records;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>

      <Card>
        <form className="flex flex-wrap gap-4">
          <input name="search" placeholder="Search employee..." defaultValue={params.search}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          <input name="date" type="date" defaultValue={params.date}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm" />
          <select name="status" defaultValue={params.status}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm">
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
            <option value="on_leave">On Leave</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-100">Filter</button>
        </form>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Check In</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Check Out</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords && filteredRecords.length > 0 ? (
                filteredRecords.map((record: Record<string, unknown>) => {
                  const p = record.profile as Record<string, string> | null;
                  return (
                    <tr key={record.id as string} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">
                            {p ? getInitials(p.first_name, p.last_name) : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{p ? `${p.first_name} ${p.last_name}` : 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{p?.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(record.date as string)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.check_in ? formatTime(record.check_in as string) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.check_out ? formatTime(record.check_out as string) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.work_hours ? formatHours(record.work_hours as number) : '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={record.status as string} /></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
