import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, StatCard } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getLeaveTypeLabel } from '@/lib/utils';
import Link from 'next/link';

export default async function LeavePage() {
  const profile = await requireEmployee();
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();

  const { data: balance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('year', currentYear)
    .single();

  const { data: requests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <Link href="/dashboard/leave/apply">
          <Button>Apply for Leave</Button>
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Paid Leave"
          value={`${(balance?.paid_allocated || 12) - (balance?.paid_used || 0)} remaining`}
          icon={<span className="text-lg">📅</span>}
          iconBg="bg-emerald-100 text-emerald-600"
          trend={`${balance?.paid_used || 0} used of ${balance?.paid_allocated || 12}`}
        />
        <StatCard
          title="Sick Leave"
          value={`${(balance?.sick_allocated || 6) - (balance?.sick_used || 0)} remaining`}
          icon={<span className="text-lg">🏥</span>}
          iconBg="bg-amber-100 text-amber-600"
          trend={`${balance?.sick_used || 0} used of ${balance?.sick_allocated || 6}`}
        />
        <StatCard
          title="Unpaid Leave"
          value={`${balance?.unpaid_used || 0} taken`}
          icon={<span className="text-lg">📋</span>}
          iconBg="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Leave History */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">From</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">To</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Days</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests && requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{getLeaveTypeLabel(req.leave_type)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.start_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.end_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{req.requested_days}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{req.admin_comments || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No leave requests yet
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
