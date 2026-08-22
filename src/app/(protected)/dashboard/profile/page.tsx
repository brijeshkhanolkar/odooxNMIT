import { requireEmployee } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { ProfileEditor } from '@/components/employees/profile-editor';
import { formatDate, getEmploymentTypeLabel } from '@/lib/utils';

export default async function ProfilePage() {
  const profile = await requireEmployee();
  const supabase = await createClient();

  const { data: jobDetails } = await supabase
    .from('job_details')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  const { data: department } = profile.department_id
    ? await supabase.from('departments').select('*').eq('id', profile.department_id).single()
    : { data: null };

  const { data: salary } = await supabase
    .from('salary_structures')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              `${profile.first_name[0]}${profile.last_name[0]}`
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-slate-500">{jobDetails?.designation || 'No designation'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={profile.status} />
              {department && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                  {department.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div><span className="text-slate-500">Employee ID:</span> <span className="font-medium">{profile.employee_id}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="font-medium">{profile.email}</span></div>
              <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{profile.phone || 'Not set'}</span></div>
              <div><span className="text-slate-500">Joining Date:</span> <span className="font-medium">{jobDetails?.joining_date ? formatDate(jobDetails.joining_date) : 'Not set'}</span></div>
              <div><span className="text-slate-500">Employment Type:</span> <span className="font-medium">{jobDetails ? getEmploymentTypeLabel(jobDetails.employment_type) : 'Not set'}</span></div>
              <div><span className="text-slate-500">Address:</span> <span className="font-medium">{profile.address || 'Not set'}</span></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Editable Fields */}
      <ProfileEditor profile={profile} />

      {/* Salary Summary */}
      {salary && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Basic Salary</p>
              <p className="text-lg font-bold text-slate-900">₹{Number(salary.basic_salary).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Allowances</p>
              <p className="text-lg font-bold text-emerald-600">+₹{Number(salary.allowances).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Deductions</p>
              <p className="text-lg font-bold text-red-600">-₹{Number(salary.deductions).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <p className="text-slate-500">Net Pay</p>
              <p className="text-lg font-bold text-violet-700">₹{(Number(salary.basic_salary) + Number(salary.allowances) - Number(salary.deductions) - Number(salary.tax)).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
