'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createEmployee } from '@/app/actions';

export default function NewEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    designation: '',
    joiningDate: '',
    employmentType: 'full_time',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.employeeId || !form.email || !form.firstName || !form.lastName || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await createEmployee({
      employeeId: form.employeeId,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      designation: form.designation,
      joiningDate: form.joiningDate,
      employmentType: form.employmentType as 'full_time' | 'part_time' | 'contract' | 'intern',
      password: form.password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      toast('success', 'Employee created successfully');
      router.push('/admin/employees');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New Employee</h1>

      <Card>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
            <Input label="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee ID *" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP-001" />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            <Select
              label="Employment Type"
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              options={[
                { value: 'full_time', label: 'Full Time' },
                { value: 'part_time', label: 'Part Time' },
                { value: 'contract', label: 'Contract' },
                { value: 'intern', label: 'Intern' },
              ]}
            />
          </div>
          <Input label="Initial Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Create Employee</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
