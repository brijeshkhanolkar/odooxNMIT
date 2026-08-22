'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { resolveLeaveRequest } from '@/app/actions';

interface LeaveActionsProps {
  requestId: string;
}

export function LeaveActions({ requestId }: LeaveActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');

  const handleResolve = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    const result = await resolveLeaveRequest(requestId, status, comments);
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', `Leave request ${status}`);
      router.push('/admin/leave');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Take Action</h3>
      <Textarea
        label="Comments (optional)"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Add a comment for the employee..."
      />
      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => handleResolve('approved')}
          loading={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          ✓ Approve
        </Button>
        <Button
          onClick={() => handleResolve('rejected')}
          loading={loading}
          variant="danger"
        >
          ✕ Reject
        </Button>
      </div>
    </Card>
  );
}
