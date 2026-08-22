import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, getLeaveTypeLabel } from '@/lib/utils';
import { LeaveActions } from '@/components/leave/leave-actions';
import { notFound } from 'next/navigation';

export default async function LeaveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: request } = await supabase
    .from('leave_requests')
    .select('*, profile:profiles(first_name, last_name, employee_id, email)')
    .eq('id', id)
    .single();

  if (!request) notFound();

  const p = request.profile as Record<string, string> | null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Leave Request Detail</h1>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
              </p>
              <p className="text-sm text-slate-500">{p?.employee_id} · {p?.email}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">Leave Type</p>
              <p className="text-sm font-medium">{getLeaveTypeLabel(request.leave_type)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Requested Days</p>
              <p className="text-sm font-medium">{request.requested_days} days</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">From</p>
              <p className="text-sm font-medium">{formatDate(request.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">To</p>
              <p className="text-sm font-medium">{formatDate(request.end_date)}</p>
            </div>
          </div>

          {request.reason && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Reason</p>
              <p className="text-sm text-slate-700">{request.reason}</p>
            </div>
          )}

          {request.admin_comments && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Admin Comments</p>
              <p className="text-sm text-slate-700">{request.admin_comments}</p>
            </div>
          )}

          {request.resolved_at && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">Resolved at: {formatDate(request.resolved_at)}</p>
            </div>
          )}
        </div>
      </Card>

      {request.status === 'pending' && (
        <LeaveActions requestId={request.id} />
      )}
    </div>
  );
}
