'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, formatHours, getLeaveTypeLabel, generateCSV, downloadCSV } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

type TabType = 'attendance' | 'leave' | 'payroll' | 'department';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'leave', label: 'Leave' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'department', label: 'Department' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'attendance' && <AttendanceReport />}
      {activeTab === 'leave' && <LeaveReport />}
      {activeTab === 'payroll' && <PayrollReport />}
      {activeTab === 'department' && <DepartmentReport />}
    </div>
  );
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const DEFAULT_REPORT_END_DATE = new Date().toISOString().split('T')[0];
const DEFAULT_REPORT_START_DATE = new Date(
  new Date(DEFAULT_REPORT_END_DATE).getTime() - 30 * 86400000
).toISOString().split('T')[0];

function AttendanceReport() {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [startDate, setStartDate] = useState(DEFAULT_REPORT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_REPORT_END_DATE);

  useEffect(() => {
    async function load() {
      const { data: records } = await supabase
        .from('attendance')
        .select('*, profile:profiles(first_name, last_name, employee_id)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .limit(500);
      setData(records || []);
    }
    load();
  }, [startDate, endDate, supabase]);

  const chartData = [
    { name: 'Present', value: data.filter((d) => d.status === 'present').length },
    { name: 'Absent', value: data.filter((d) => d.status === 'absent').length },
    { name: 'Half Day', value: data.filter((d) => d.status === 'half_day').length },
    { name: 'On Leave', value: data.filter((d) => d.status === 'on_leave').length },
  ].filter((d) => d.value > 0);

  const handleExport = () => {
    const headers = ['Employee', 'ID', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'];
    const rows = data.map((d) => {
      const p = d.profile as Record<string, string> | null;
      return [
        p ? `${p.first_name} ${p.last_name}` : '',
        p?.employee_id || '',
        d.date as string,
        d.check_in ? new Date(d.check_in as string).toLocaleTimeString() : '',
        d.check_out ? new Date(d.check_out as string).toLocaleTimeString() : '',
        String(d.work_hours || ''),
        d.status as string,
      ];
    });
    downloadCSV(generateCSV(headers, rows), `attendance_report_${startDate}_${endDate}.csv`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <Button variant="outline" onClick={handleExport}>📥 Export CSV</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Status Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Total Records</span>
              <span className="text-sm font-bold">{data.length}</span>
            </div>
            {chartData.map((item, i) => (
              <div key={item.name} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeaveReport() {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function load() {
      const { data: records } = await supabase
        .from('leave_requests')
        .select('*, profile:profiles(first_name, last_name, employee_id)')
        .order('created_at', { ascending: false })
        .limit(200);
      setData(records || []);
    }
    load();
  }, [supabase]);

  const handleExport = () => {
    const headers = ['Employee', 'ID', 'Type', 'From', 'To', 'Days', 'Status', 'Comments'];
    const rows = data.map((d) => {
      const p = d.profile as Record<string, string> | null;
      return [
        p ? `${p.first_name} ${p.last_name}` : '',
        p?.employee_id || '',
        d.leave_type as string,
        d.start_date as string,
        d.end_date as string,
        String(d.requested_days),
        d.status as string,
        (d.admin_comments as string) || '',
      ];
    });
    downloadCSV(generateCSV(headers, rows), 'leave_report.csv');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleExport}>📥 Export CSV</Button>
        </div>
      </Card>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">From</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">To</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Days</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => {
                const p = d.profile as Record<string, string> | null;
                return (
                  <tr key={d.id as string} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm">{p ? `${p.first_name} ${p.last_name}` : '—'}</td>
                    <td className="px-6 py-4 text-sm">{getLeaveTypeLabel(d.leave_type as string)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(d.start_date as string)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(d.end_date as string)}</td>
                    <td className="px-6 py-4 text-sm">{d.requested_days as number}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status as string} /></td>
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

function PayrollReport() {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    async function load() {
      const { data: records } = await supabase
        .from('payslips')
        .select('*, profile:profiles(first_name, last_name, employee_id)')
        .eq('month', Number(month))
        .eq('year', Number(year))
        .order('created_at', { ascending: false });
      setData(records || []);
    }
    load();
  }, [month, year, supabase]);

  const handleExport = () => {
    const headers = ['Employee', 'ID', 'Basic', 'Allowances', 'Deductions', 'Tax', 'Gross', 'Net'];
    const rows = data.map((d) => {
      const p = d.profile as Record<string, string> | null;
      return [
        p ? `${p.first_name} ${p.last_name}` : '',
        p?.employee_id || '',
        String(d.basic_salary), String(d.allowances), String(d.deductions),
        String(d.tax), String(d.gross_pay), String(d.net_pay),
      ];
    });
    downloadCSV(generateCSV(headers, rows), `payroll_report_${year}_${month}.csv`);
  };

  const totalNet = data.reduce((sum, d) => sum + Number(d.net_pay), 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1)}>{new Date(2000, i).toLocaleString('en-US', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={String(new Date().getFullYear() - 2 + i)}>{new Date().getFullYear() - 2 + i}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={handleExport}>📥 Export CSV</Button>
          <div className="ml-auto p-3 bg-violet-50 rounded-lg">
            <p className="text-xs text-slate-500">Total Payroll</p>
            <p className="text-lg font-bold text-violet-700">{formatCurrency(totalNet)}</p>
          </div>
        </div>
      </Card>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Basic</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Allowances</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Deductions</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Tax</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Gross</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase px-6 py-3">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => {
                const p = d.profile as Record<string, string> | null;
                return (
                  <tr key={d.id as string} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium">{p ? `${p.first_name} ${p.last_name}` : '—'}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(Number(d.basic_salary))}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">+{formatCurrency(Number(d.allowances))}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-{formatCurrency(Number(d.deductions))}</td>
                    <td className="px-6 py-4 text-sm text-amber-600">-{formatCurrency(Number(d.tax))}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(Number(d.gross_pay))}</td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(Number(d.net_pay))}</td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No payslips for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DepartmentReport() {
  const supabase = createClient();
  const [data, setData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: depts } = await supabase.from('departments').select('id, name');
      const { data: profiles } = await supabase.from('profiles').select('department_id').eq('status', 'active');
      
      const counts = (depts || []).map((d) => ({
        name: d.name,
        count: (profiles || []).filter((p) => p.department_id === d.id).length,
      }));
      setData(counts);
    }
    load();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Headcount by Department</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Department Summary</h3>
          <div className="space-y-3">
            {data.map((dept, i) => (
              <div key={dept.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-slate-900">{dept.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{dept.count} employees</span>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No departments configured</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
