import { createClient } from '@supabase/supabase-js';

// Admin client bypasses RLS - ONLY use server-side for admin operations
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'This action requires SUPABASE_SERVICE_ROLE_KEY. Add the service_role key from Supabase Dashboard > Project Settings > API to .env.local. Never use the publishable key here.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
