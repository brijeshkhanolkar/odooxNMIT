import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id, roles:role_id(name)')
      .eq('id', user.id)
      .single();

    const roleName = (profile?.roles as unknown as { name: string } | null)?.name;
    redirect(roleName === 'admin' ? '/admin' : '/dashboard');
  }

  redirect('/login');
}
