'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateSalaryStructure } from '@/app/actions';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

export default function SalaryPage({ params }: { params: Promise<{ employeeId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    tax: 0,
  });

  useEffect(() => {
    params.then(async (p) => {
      setEmployeeId(p.employeeId);
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, salary_structures(*)')
        .eq('id', p.employeeId)
        .single();

      if (profile) {
        setEmployee(profile);
        const salary = (profile.salary_structures as Record<string, unknown>[] | null)?.[0];
        if (salary) {
          setForm({
            basicSalary: Number(salary.basic_salary) || 0,
            allowances: Number(salary.allowances) || 0,
            deductions: Number(salary.deductions) || 0,
            tax: Number(salary.tax) || 0,
          });
        }
      }
    });
  }, [params]);

  const gross = form.basicSalary + form.allowances;
  const net = gross - form.deductions - form.tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateSalaryStructure(employeeId, form);
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Salary structure updated');
      router.push('/admin/payroll');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Salary Structure {employee ? `— ${(employee as Record<string, string>).first_name} ${(employee as Record<string, string>).last_name}` : ''}
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Basic Salary (₹)"
            type="number"
            value={form.basicSalary}
            onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
            min={0}
          />
          <Input
            label="Allowances (₹)"
            type="number"
            value={form.allowances}
            onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
            min={0}
          />
          <Input
            label="Deductions (₹)"
            type="number"
            value={form.deductions}
            onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })}
            min={0}
          />
          <Input
            label="Tax (₹)"
            type="number"
            value={form.tax}
            onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
            min={0}
          />

          <div className="p-4 bg-violet-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Gross Pay (Basic + Allowances)</span>
              <span className="font-medium">{formatCurrency(gross)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Deductions</span>
              <span className="font-medium text-red-600">-{formatCurrency(form.deductions + form.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-violet-200 pt-2">
              <span className="text-violet-700">Net Pay</span>
              <span className="text-violet-700">{formatCurrency(net)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Save Salary Structure</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
