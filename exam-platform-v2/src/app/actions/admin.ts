'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupportDb } from '@/lib/supabase-support';
import { getSupportSession } from '@/lib/support-auth';

async function requireAdminToken() {
  const session = await getSupportSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'admin') throw new Error('Admin access required.');
  return session.token;
}

export async function setPublishingAction(formData: FormData) {
  const token = await requireAdminToken();
  const enabled = String(formData.get('enabled') || '') === 'true';
  const { data, error } = await getSupportDb().rpc('support_v2_set_publishing', {
    p_token: token,
    p_enabled: enabled,
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || 'Unable to change publishing status.');
  revalidatePath('/');
}

export async function generateScheduleAction() {
  const token = await requireAdminToken();
  const { data, error } = await getSupportDb().rpc('support_v2_generate_schedule', {
    p_token: token,
    p_day: null,
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || 'Unable to generate the schedule.');
  revalidatePath('/');
}
