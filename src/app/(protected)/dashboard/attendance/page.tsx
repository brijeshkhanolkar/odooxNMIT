import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, formatTime, formatHours } from '@/lib/utils';

export default async function AttendancePage() {
  const profile = await requireEmployee();
  const supabase = await createClient();

  const { data: records } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profile.id)
    .order('date', { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Check In</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Check Out</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records && records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.check_in ? formatTime(record.check_in) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.check_out ? formatTime(record.check_out) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.work_hours ? formatHours(record.work_hours) : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No attendance records yet
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
