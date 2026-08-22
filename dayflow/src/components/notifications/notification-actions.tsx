'use client';

import { Button } from '@/components/ui/button';
import { markAllNotificationsRead } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function NotificationActions() {
  const router = useRouter();

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
      Mark all read
    </Button>
  );
}
