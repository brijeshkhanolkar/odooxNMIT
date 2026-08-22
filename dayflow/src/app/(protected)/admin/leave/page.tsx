import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, getLeaveTypeLabel, getInitials } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from('leave_requests')
    .select('*, profile:profiles(first_name, last_name, employee_id, avatar_url)')
    .order('created_at', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.type) {
    query = query.eq('leave_type', params.type);
  }

  const { data: requests } = await query;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>

      <Card>
        <form className="flex flex-wrap gap-4">
          <select name="status" defaultValue={params.status} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select name="type" defaultValue={params.type} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm">
            <option value="">All Types</option>
            <option value="paid">Paid Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
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
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">From</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">To</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Days</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests && requests.length > 0 ? (
                requests.map((req: Record<string, unknown>) => {
                  const p = req.profile as Record<string, string> | null;
                  return (
                    <tr key={req.id as string} className="hover:bg-slate-50">
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
                      <td className="px-6 py-4 text-sm text-slate-600">{getLeaveTypeLabel(req.leave_type as string)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.start_date as string)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.end_date as string)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{req.requested_days as number}</td>
                      <td className="px-6 py-4"><StatusBadge status={req.status as string} /></td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/leave/${req.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                          {req.status === 'pending' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No leave requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
