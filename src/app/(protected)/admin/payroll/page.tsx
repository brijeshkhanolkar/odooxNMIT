import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, getInitials } from '@/lib/utils';
import Link from 'next/link';
import { GeneratePayslipsButton } from '@/components/payroll/generate-payslips-button';

export default async function AdminPayrollPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from('profiles')
    .select('*, salary_structures(*), role:roles(name)')
    .eq('status', 'active')
    .order('first_name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
        <GeneratePayslipsButton />
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Employee Salary Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Basic</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Allowances</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Deductions</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Tax</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Net Pay</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees?.map((emp: Record<string, unknown>) => {
                const salary = (emp.salary_structures as Record<string, unknown>[] | null)?.[0];
                const basic = salary ? Number(salary.basic_salary) : 0;
                const allowances = salary ? Number(salary.allowances) : 0;
                const deductions = salary ? Number(salary.deductions) : 0;
                const tax = salary ? Number(salary.tax) : 0;
                const net = basic + allowances - deductions - tax;
                return (
                  <tr key={emp.id as string} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">
                          {getInitials(emp.first_name as string, emp.last_name as string)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{emp.first_name as string} {emp.last_name as string}</p>
                          <p className="text-xs text-slate-500">{emp.employee_id as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{salary ? formatCurrency(basic) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">{salary ? `+${formatCurrency(allowances)}` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{salary ? `-${formatCurrency(deductions)}` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-amber-600">{salary ? `-${formatCurrency(tax)}` : '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{salary ? formatCurrency(net) : '—'}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/payroll/salary/${emp.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        {salary ? 'Edit' : 'Set Up'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
