import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminDb } from '@/lib/supabase-admin';

export const SUPPORT_COOKIE = 'exam_support_session';

export type SupportUser = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  must_change_password?: boolean;
};

export async function getSupportSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPORT_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await getAdminDb().rpc('support_me', { p_token: token });
  if (error || !data?.id) return null;

  return { token, user: data as SupportUser };
}

export async function requireSupportSession() {
  const session = await getSupportSession();
  if (!session) redirect('/login');
  return session;
}
