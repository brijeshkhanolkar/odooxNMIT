'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}) {
  const supabase = await createClient();

  // The database trigger in migration 015 creates the matching employee
  // profile and leave balance inside the same transaction.
  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        employee_id: formData.employeeId,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Check your email to confirm your account' };
}

export async function signIn(formData: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role for redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id, roles:role_id(name)')
    .eq('id', data.user.id)
    .single();

  const roleName = (profile?.roles as unknown as { name: string } | null)?.name;

  if (roleName === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Password reset email sent. Check your inbox.' };
}

export async function resetPassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
