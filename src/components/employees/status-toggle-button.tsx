'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { toggleEmployeeStatus } from '@/app/actions';

export function StatusToggleButton({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (currentStatus === 'terminated') return null;

  const isActive = currentStatus === 'active';
  const newStatus = isActive ? 'inactive' : 'active';

  const handleToggle = async () => {
    if (!window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this employee?`)) return;
    setLoading(true);
    const result = await toggleEmployeeStatus(userId, newStatus);
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', `Employee ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      variant={isActive ? 'danger' : 'outline'}
      onClick={handleToggle}
      loading={loading}
      className={!isActive ? 'text-emerald-600 border-emerald-300 hover:bg-emerald-50' : ''}
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </Button>
  );
}
