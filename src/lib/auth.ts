import { supabase } from '@/lib/supabase';

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}