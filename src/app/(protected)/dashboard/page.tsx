import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, StatCard } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { AttendanceWidget } from '@/components/dashboard/attendance-widget';
import { formatDate, getLeaveTypeLabel } from '@/lib/utils';
import Link from 'next/link';

export default async function EmployeeDashboard() {
  const profile = await requireEmployee();
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  // Fetch today's attendance
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('date', today)
    .single();

  // Fetch leave balance
  const { data: leaveBalance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('year', currentYear)
    .single();

  // Fetch recent leave requests
  const { data: recentLeaves } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent notifications
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {profile.first_name}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s your workday overview for today
        </p>
      </div>

      {/* Attendance Widget */}
      <AttendanceWidget attendance={todayAttendance} profileId={profile.id} />

      {/* Leave Balance Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Paid Leave"
            value={`${(leaveBalance?.paid_allocated || 12) - (leaveBalance?.paid_used || 0)} / ${leaveBalance?.paid_allocated || 12}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            iconBg="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="Sick Leave"
            value={`${(leaveBalance?.sick_allocated || 6) - (leaveBalance?.sick_used || 0)} / ${leaveBalance?.sick_allocated || 6}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            iconBg="bg-amber-100 text-amber-600"
          />
          <StatCard
            title="Unpaid Leave"
            value={`${leaveBalance?.unpaid_used || 0} taken`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-blue-100 text-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Leave Requests</h3>
            <Link
              href="/dashboard/leave"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recentLeaves && recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {getLeaveTypeLabel(leave.leave_type)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(leave.start_date)} — {formatDate(leave.end_date)} ({leave.requested_days} days)
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No leave requests yet
            </p>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            <Link
              href="/dashboard/notifications"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recentNotifications && recentNotifications.length > 0 ? (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg ${notif.is_read ? 'bg-slate-50' : 'bg-violet-50 border border-violet-100'}`}
                >
                  <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(notif.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No notifications yet
            </p>
          )}
        </Card>
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Profile', href: '/dashboard/profile', icon: '👤', color: 'bg-violet-50 hover:bg-violet-100' },
            { label: 'Attendance', href: '/dashboard/attendance', icon: '⏰', color: 'bg-emerald-50 hover:bg-emerald-100' },
            { label: 'Leave', href: '/dashboard/leave', icon: '📅', color: 'bg-amber-50 hover:bg-amber-100' },
            { label: 'Payroll', href: '/dashboard/payroll', icon: '💰', color: 'bg-blue-50 hover:bg-blue-100' },
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
