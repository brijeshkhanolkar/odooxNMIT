'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { deleteDepartment } from '@/app/actions';

export function DeleteDepartmentButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteDepartment(id);
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Department deleted');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button size="sm" variant="danger" onClick={handleDelete} loading={loading}>
      Delete
    </Button>
  );
}
