import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ProfileWithRole, UserRole } from '@/lib/types';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<ProfileWithRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, role:roles(*)')
    .eq('id', user.id)
    .single();

  return profile as ProfileWithRole | null;
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  return profile?.role?.name || null;
}

export async function requireAuth(): Promise<ProfileWithRole> {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login');
  }
  return profile;
}

export async function requireAdmin(): Promise<ProfileWithRole> {
  const profile = await requireAuth();
  if (profile.role.name !== 'admin') {
    redirect('/dashboard');
  }
  return profile;
}

export async function requireEmployee(): Promise<ProfileWithRole> {
  const profile = await requireAuth();
  return profile;
}
