import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { NotificationActions } from '@/components/notifications/notification-actions';

export default async function NotificationsPage() {
  const profile = await requireEmployee();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <NotificationActions />
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-all duration-200 ${!notif.is_read ? 'border-violet-200 bg-violet-50/50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.is_read ? 'bg-slate-300' : 'bg-violet-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(notif.created_at)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-500 text-center py-12">No notifications yet</p>
        </Card>
      )}
    </div>
  );
}
