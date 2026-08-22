'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateEmployee } from '@/app/actions';

interface Department { id: string; name: string; }

interface EmployeeEditorProps {
  userId: string;
  initialData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    departmentId: string | null;
    designation: string;
    employmentType: string;
    status: string;
  };
  departments: Department[];
}

export function EmployeeEditor({ userId, initialData, departments }: EmployeeEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialData);

  const handleOpen = () => {
    setForm(initialData);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateEmployee(userId, {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      address: form.address,
      departmentId: form.departmentId || null,
      designation: form.designation,
      employmentType: form.employmentType,
      status: form.status,
    });
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', 'Employee updated successfully');
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        Edit Employee
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Employee" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          <Textarea
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Enter address"
          />
          <Select
            label="Department"
            value={form.departmentId || ''}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value || null })}
            options={[
              { value: '', label: 'No Department' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          <Input
            label="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            placeholder="e.g. Software Engineer"
          />
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
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'terminated', label: 'Terminated' },
            ]}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
