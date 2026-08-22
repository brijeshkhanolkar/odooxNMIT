'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createDepartment, updateDepartment } from '@/app/actions';

interface DepartmentFormProps {
  department?: { id: string; name: string; description: string | null };
}

export function DepartmentForm({ department }: DepartmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(department?.name || '');
  const [description, setDescription] = useState(department?.description || '');

  const handleOpen = () => {
    setName(department?.name || '');
    setDescription(department?.description || '');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const result = department
      ? await updateDepartment(department.id, { name, description })
      : await createDepartment({ name, description });
    if (result.error) {
      toast('error', result.error);
    } else {
      toast('success', department ? 'Department updated' : 'Department created');
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant={department ? 'outline' : 'primary'}
        size={department ? 'sm' : 'md'}
      >
        {department ? 'Edit' : '+ Add Department'}
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={department ? 'Edit Department' : 'New Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Engineering"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this department..."
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
