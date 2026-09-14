'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupportDb } from '@/lib/supabase-support';
import { SUPPORT_COOKIE } from '@/lib/support-auth';

export async function loginAction(formData: FormData) {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !password) redirect('/login?error=missing');

  const { data, error } = await getSupportDb().rpc('support_login', {
    p_username: username,
    p_password: password,
  });

  if (error || !data?.ok || !data?.token) {
    const reason = data?.error === 'too_many_attempts' ? 'rate' : 'invalid';
    redirect(`/login?error=${reason}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SUPPORT_COOKIE, String(data.token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: data.expires_at ? new Date(data.expires_at) : undefined,
  });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPORT_COOKIE)?.value;

  if (token) {
    try {
      await getSupportDb().rpc('support_logout', { p_token: token });
    } catch {
      // Clear the browser session even if the backend logout call is unavailable.
    }
  }

  cookieStore.set(SUPPORT_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  redirect('/login');
}
