'use client';

import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartDataItem {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

interface AdminChartsProps {
  chartData: ChartDataItem[];
}

export function AdminCharts({ chartData }: AdminChartsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Attendance Overview (Last 7 Days)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} name="On Leave" />
            <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
