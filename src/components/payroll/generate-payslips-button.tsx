'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { generatePayslips } from '@/app/actions';

export function GeneratePayslipsButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generatePayslips(Number(month), Number(year));
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', `Generated ${result.count} payslips`);
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - 2 + i),
    label: String(new Date().getFullYear() - 2 + i),
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate Payslips</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Generate Monthly Payslips">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Generate payslips for all active employees with salary structures.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" value={month} onChange={(e) => setMonth(e.target.value)} options={months} />
            <Select label="Year" value={year} onChange={(e) => setYear(e.target.value)} options={years} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleGenerate} loading={loading}>Generate</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
