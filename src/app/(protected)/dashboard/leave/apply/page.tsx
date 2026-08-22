'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { applyLeave } from '@/app/actions';
import { calculateDaysBetween } from '@/lib/utils';

export default function ApplyLeavePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');

  const requestedDays = form.startDate && form.endDate
    ? calculateDaysBetween(form.startDate, form.endDate)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.startDate || !form.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError('End date must be after start date');
      return;
    }
    if (new Date(form.startDate) < new Date(new Date().toISOString().split('T')[0])) {
      setError('Cannot apply leave for past dates');
      return;
    }
    if (requestedDays === 0) {
      setError('Selected dates contain only weekends');
      return;
    }
    if (!form.reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setLoading(true);
    const result = await applyLeave({
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      requestedDays,
      reason: form.reason,
    });

    if (result.error) {
      setError(result.error);
    } else {
      toast('success', 'Leave request submitted successfully');
      router.push('/dashboard/leave');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Apply for Leave</h1>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            options={[
              { value: 'paid', label: 'Paid Leave' },
              { value: 'sick', label: 'Sick Leave' },
              { value: 'unpaid', label: 'Unpaid Leave' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          {requestedDays > 0 && (
            <div className="p-3 bg-violet-50 rounded-lg text-sm text-violet-700 font-medium">
              Total working days: {requestedDays}
            </div>
          )}

          <Textarea
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Please provide a reason for your leave request"
          />

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Submit Request</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
