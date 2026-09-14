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

async function runAdminRpc(name: string, args: Record<string, unknown>) {
  const token = await requireAdminToken();
  const { data, error } = await getSupportDb().rpc(name, { p_token: token, ...args });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || `Unable to run ${name}.`);
  return data;
}

export async function setPublishingAction(formData: FormData) {
  const enabled = String(formData.get('enabled') || '') === 'true';
  await runAdminRpc('support_v2_set_publishing', { p_enabled: enabled });
  revalidatePath('/');
  revalidatePath('/publishing');
}

export async function generateScheduleAction() {
  await runAdminRpc('support_v2_generate_schedule', { p_day: null });
  revalidatePath('/');
  revalidatePath('/publishing');
}

export async function setQuestionVerifiedAction(formData: FormData) {
  const questionId = String(formData.get('questionId') || '');
  const verified = String(formData.get('verified') || '') === 'true';
  if (!questionId) throw new Error('Question ID is required.');
  await runAdminRpc('support_v2_question_set_verified', { p_question_id: questionId, p_verified: verified });
  revalidatePath('/questions');
  revalidatePath('/system');
}

export async function setQuestionTopicAction(formData: FormData) {
  const questionId = String(formData.get('questionId') || '');
  const topicId = String(formData.get('topicId') || '').trim();
  if (!questionId) throw new Error('Question ID is required.');
  await runAdminRpc('support_v2_question_set_topic', { p_question_id: questionId, p_topic_id: topicId || null });
  revalidatePath('/questions');
  revalidatePath('/');
  revalidatePath('/system');
}

export async function setReviewStatusAction(formData: FormData) {
  const reviewId = Number(formData.get('reviewId'));
  const status = String(formData.get('status') || '');
  if (!Number.isFinite(reviewId)) throw new Error('Review ID is required.');
  await runAdminRpc('support_v2_review_set_status', { p_review_id: reviewId, p_status: status });
  revalidatePath('/reviews');
  revalidatePath('/');
}

export async function setDiscussionStatusAction(formData: FormData) {
  const discussionId = String(formData.get('discussionId') || '');
  const status = String(formData.get('status') || '');
  if (!discussionId) throw new Error('Discussion ID is required.');
  await runAdminRpc('support_v2_discussion_set_status', { p_discussion_id: discussionId, p_status: status });
  revalidatePath('/discussions');
  revalidatePath('/');
}
