import { getAdminDb } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result?.ok) {
    throw new Error(result?.description || `Telegram publish failed (${response.status})`);
  }

  return result.result;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminDb();
  const now = new Date().toISOString();

  // Idempotent: if today's challenge pairs already exist, these calls create nothing.
  // WhatsApp posts are prepared in the same queue even while direct Channel publishing
  // remains disabled; admins can copy/review them from the dashboard.
  const [telegramSchedule, whatsappSchedule] = await Promise.all([
    db.rpc('exam_generate_daily_challenge_schedule', { p_platform: 'telegram_channel' }),
    db.rpc('exam_generate_daily_challenge_schedule', { p_platform: 'whatsapp_channel' }),
  ]);

  const { data: duePosts, error } = await db
    .from('exam_content_posts')
    .select('id, platform, post_type, content, scheduled_at, status')
    .in('status', ['approved', 'scheduled'])
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(25);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const post of duePosts || []) {
    if (!post.content?.trim()) {
      await db.from('exam_content_posts').update({
        status: 'failed',
        error_message: 'Post has no content',
        updated_at: new Date().toISOString(),
      }).eq('id', post.id);
      results.push({ id: post.id, ok: false, error: 'empty content' });
      continue;
    }

    if (post.platform === 'whatsapp_channel') {
      // Kept queued until an approved WhatsApp Channel publishing adapter is configured.
      results.push({ id: post.id, ok: false, skipped: 'whatsapp adapter not configured' });
      continue;
    }

    const destination = post.platform === 'telegram_group'
      ? process.env.TELEGRAM_DISCUSSION_GROUP_ID
      : process.env.TELEGRAM_CHANNEL_ID;

    if (!destination || !process.env.TELEGRAM_BOT_TOKEN) {
      results.push({ id: post.id, ok: false, skipped: 'telegram destination not configured' });
      continue;
    }

    await db.from('exam_content_posts').update({ status: 'publishing' }).eq('id', post.id);

    try {
      const message = await sendTelegramMessage(destination, post.content);
      await db.from('exam_content_posts').update({
        status: 'published',
        published_at: new Date().toISOString(),
        external_message_id: String(message.message_id),
        error_message: null,
        updated_at: new Date().toISOString(),
      }).eq('id', post.id);
      results.push({ id: post.id, ok: true, messageId: message.message_id });
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : 'Unknown publish error';
      await db.from('exam_content_posts').update({
        status: 'failed',
        error_message: message,
        updated_at: new Date().toISOString(),
      }).eq('id', post.id);
      results.push({ id: post.id, ok: false, error: message });
    }
  }

  return Response.json({
    ok: true,
    checkedAt: now,
    scheduling: {
      telegram: telegramSchedule.data ?? null,
      telegramError: telegramSchedule.error?.message ?? null,
      whatsapp: whatsappSchedule.data ?? null,
      whatsappError: whatsappSchedule.error?.message ?? null,
    },
    processed: results.length,
    results,
  });
}
