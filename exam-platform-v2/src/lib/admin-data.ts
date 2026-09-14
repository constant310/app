import { getSupportDb } from '@/lib/supabase-support';
import { requireAdminSession } from '@/lib/support-auth';

export async function adminRpc<T>(functionName: string, args: Record<string, unknown> = {}) {
  const session = await requireAdminSession();
  const { data, error } = await getSupportDb().rpc(functionName, {
    p_token: session.token,
    ...args,
  });

  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || `Unable to load ${functionName}.`);

  return { session, data: data as T };
}
