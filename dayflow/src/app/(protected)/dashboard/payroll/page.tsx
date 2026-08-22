import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PayslipPDFButton } from '@/components/payroll/payslip-pdf-button';
import Link from 'next/link';

export default async function EmployeePayrollPage() {
  const profile = await requireEmployee();
  const supabase = await createClient();

  const { data: salary } = await supabase
    .from('salary_structures')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  const { data: payslips } = await supabase
    .from('payslips')
    .select('*')
    .eq('profile_id', profile.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  const gross = salary ? Number(salary.basic_salary) + Number(salary.allowances) : 0;
  const net = salary ? gross - Number(salary.deductions) - Number(salary.tax) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Payroll</h1>

      {salary ? (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Basic Salary</p>
              <p className="text-lg font-bold">{formatCurrency(Number(salary.basic_salary))}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-slate-500">Allowances</p>
              <p className="text-lg font-bold text-emerald-600">+{formatCurrency(Number(salary.allowances))}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Gross Pay</p>
              <p className="text-lg font-bold">{formatCurrency(gross)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-slate-500">Deductions</p>
              <p className="text-lg font-bold text-red-600">-{formatCurrency(Number(salary.deductions))}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-slate-500">Tax</p>
              <p className="text-lg font-bold text-amber-600">-{formatCurrency(Number(salary.tax))}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <p className="text-xs text-slate-500">Net Pay</p>
              <p className="text-lg font-bold text-violet-700">{formatCurrency(net)}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-500 text-center py-8">Salary structure not set up yet</p>
        </Card>
      )}

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Payslips</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Period</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Gross Pay</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Net Pay</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Generated</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payslips && payslips.length > 0 ? (
                payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {new Date(slip.year, slip.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(Number(slip.gross_pay))}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(Number(slip.net_pay))}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(slip.created_at)}</td>
                    <td className="px-6 py-4">
                      <PayslipPDFButton payslip={slip} employeeName={`${profile.first_name} ${profile.last_name}`} employeeId={profile.employee_id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No payslips generated yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
