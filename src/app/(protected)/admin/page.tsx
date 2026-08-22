import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { StatCard, Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate, formatTime, getLeaveTypeLabel } from '@/lib/utils';
import { AdminCharts } from '@/components/dashboard/admin-charts';
import Link from 'next/link';

export default async function AdminDashboard() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Stats
  const { count: totalEmployees } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: presentToday } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .eq('status', 'present');

  const { count: onLeaveToday } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .eq('status', 'on_leave');

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Recent attendance
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('*, profile:profiles(first_name, last_name, employee_id, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(8);

  // Pending leave requests
  const { data: pendingLeaveRequests } = await supabase
    .from('leave_requests')
    .select('*, profile:profiles(first_name, last_name, employee_id, avatar_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  // Attendance data for charts (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const { data: attendanceChartData } = await supabase
    .from('attendance')
    .select('date, status')
    .gte('date', last7Days[0])
    .lte('date', last7Days[6]);

  const chartData = last7Days.map((date) => {
    const dayRecords = attendanceChartData?.filter((a) => a.date === date) || [];
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      present: dayRecords.filter((a) => a.status === 'present').length,
      absent: dayRecords.filter((a) => a.status === 'absent').length,
      leave: dayRecords.filter((a) => a.status === 'on_leave').length,
    };
  });

  const total = totalEmployees || 0;
  const present = presentToday || 0;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your organization</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={total}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          iconBg="bg-violet-100 text-violet-600"
        />
        <StatCard
          title="Present Today"
          value={present}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-emerald-100 text-emerald-600"
          trend={`${attendanceRate}% rate`}
          trendUp={attendanceRate >= 80}
        />
        <StatCard
          title="On Leave"
          value={onLeaveToday || 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          iconBg="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingLeaves || 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-red-100 text-red-600"
        />
      </div>

      {/* Charts */}
      <AdminCharts chartData={chartData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Attendance</h3>
            <Link href="/admin/attendance" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View all →
            </Link>
          </div>
          {recentAttendance && recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((record: Record<string, unknown>) => {
                const p = record.profile as Record<string, string> | null;
                return (
                  <div key={record.id as string} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">
                        {p ? `${(p.first_name || '')[0]}${(p.last_name || '')[0]}` : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.check_in ? formatTime(record.check_in as string) : 'No check-in'}
                          {record.check_out ? ` — ${formatTime(record.check_out as string)}` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={record.status as string} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No attendance records</p>
          )}
        </Card>

        {/* Pending Leave Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Pending Leave Requests</h3>
            <Link href="/admin/leave" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View all →
            </Link>
          </div>
          {pendingLeaveRequests && pendingLeaveRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaveRequests.map((req: Record<string, unknown>) => {
                const p = req.profile as Record<string, string> | null;
                return (
                  <Link
                    key={req.id as string}
                    href={`/admin/leave/${req.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getLeaveTypeLabel(req.leave_type as string)} · {formatDate(req.start_date as string)} — {formatDate(req.end_date as string)}
                      </p>
                    </div>
                    <StatusBadge status="pending" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No pending requests</p>
          )}
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Employees', href: '/admin/employees', icon: '👥', color: 'bg-violet-50 hover:bg-violet-100' },
            { label: 'Attendance', href: '/admin/attendance', icon: '⏰', color: 'bg-emerald-50 hover:bg-emerald-100' },
            { label: 'Leave', href: '/admin/leave', icon: '📋', color: 'bg-amber-50 hover:bg-amber-100' },
            { label: 'Payroll', href: '/admin/payroll', icon: '💰', color: 'bg-blue-50 hover:bg-blue-100' },
            { label: 'Reports', href: '/admin/reports', icon: '📊', color: 'bg-pink-50 hover:bg-pink-100' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${item.color} rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md`}
            >
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
