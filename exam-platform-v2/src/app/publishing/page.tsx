import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { generateScheduleAction, setPublishingAction } from '@/app/actions/admin';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Post = { id:string; platform:string; post_type:string; question_id:string|null; scheduled_at:string; status:string; published_at:string|null; external_message_id:string|null; error_message:string|null; metadata:Record<string,unknown>|null };
type CronJob = { jobid:number; jobname:string; schedule:string; active:boolean };
type Distribution = { telegram_channel_chat_id?:string|null; telegram_group_chat_id?:string|null; timezone_name?:string|null; web_search_url?:string|null; telegram_channel_ready?:boolean; telegram_group_ready?:boolean; telegram_verified_at?:string|null };
type Payload = { ok:boolean; posts:Post[]; cron:CronJob[]; distribution:Distribution; failed_total:number };

export default async function PublishingPage() {
  const { session, data } = await adminRpc<Payload>('support_v2_publishing');
  const enabled = data.cron.length > 0 && data.cron.every(job => job.active);
  const ready = Boolean(data.distribution.telegram_channel_ready && data.distribution.telegram_group_ready);
  const scheduled = data.posts.filter(p => ['approved','scheduled','publishing'].includes(p.status)).length;
  const published = data.posts.filter(p => p.status === 'published').length;
  return (
    <AdminShell active="publishing" title="Publishing Control" subtitle="Manage the four daily challenge slots, inspect delivery history and keep Telegram automation fail-safe." user={session.user}
      headerActions={<div className={enabled ? 'status-pill success' : 'status-pill warn'}>{enabled ? 'Auto publishing ON' : 'Auto publishing OFF'}</div>}>
      <section className="stats-grid compact">
        <StatCard label="Queue shown" value={scheduled} hint="Approved/scheduled" />
        <StatCard label="Published shown" value={published} hint="Recent delivery history" tone="good" />
        <StatCard label="Failed all-time" value={data.failed_total || 0} tone={(data.failed_total || 0) ? 'danger' : 'good'} />
        <StatCard label="Telegram readiness" value={ready ? 'READY' : 'BLOCKED'} tone={ready ? 'good' : 'danger'} />
      </section>

      <section className="panel control-panel">
        <div className="panel-title"><div><p className="eyebrow">Operations</p><h2>Daily challenge engine</h2></div><span>{data.distribution.timezone_name || 'Africa/Lagos'}</span></div>
        <p className="control-copy">Generate the current day’s Telegram and WhatsApp queue manually, or enable the four WAT cron slots. Enabling remains blocked unless both Telegram destinations are verified.</p>
        <div className="control-actions">
          <form action={generateScheduleAction}><button className="primary-button" type="submit">Generate today’s schedule</button></form>
          <form action={setPublishingAction}><input type="hidden" name="enabled" value={enabled ? 'false' : 'true'} /><button className={enabled ? 'danger-button' : 'primary-button'} type="submit" disabled={!enabled && !ready}>{enabled ? 'Disable auto publishing' : 'Enable auto publishing'}</button></form>
        </div>
        {!ready ? <div className="notice warning">Automation is locked until the bot is verified in both the challenge channel and discussion group.</div> : null}
      </section>

      <section className="dashboard-grid">
        <article className="panel span-5">
          <div className="panel-title"><div><p className="eyebrow">Scheduler</p><h2>WAT publishing clock</h2></div></div>
          <div className="table-list">{data.cron.map(job => <div className="table-row" key={job.jobid}><div><strong>{job.jobname.replace('exam-v2-','').replace('-wat',' WAT')}</strong><small>{job.schedule} UTC cron</small></div><span className={`badge ${job.active ? 'severity-low' : 'severity-medium'}`}>{job.active ? 'active' : 'disabled'}</span></div>)}</div>
        </article>
        <article className="panel span-7">
          <div className="panel-title"><div><p className="eyebrow">Destinations</p><h2>Distribution readiness</h2></div></div>
          <div className="connection-grid">
            <div><span>Telegram channel</span><strong>{data.distribution.telegram_channel_chat_id || 'Not configured'}</strong><small>{data.distribution.telegram_channel_ready ? 'Verified for publishing' : 'Not ready'}</small></div>
            <div><span>Discussion group</span><strong>{data.distribution.telegram_group_chat_id || 'Not configured'}</strong><small>{data.distribution.telegram_group_ready ? 'Verified for posting' : 'Not ready'}</small></div>
            <div><span>Search fallback</span><strong>Render / SearXNG</strong><small>{data.distribution.web_search_url || 'Not configured'}</small></div>
          </div>
          {data.distribution.telegram_verified_at ? <p className="verification-time">Last Telegram permission check: {new Date(data.distribution.telegram_verified_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</p> : null}
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><div><p className="eyebrow">Delivery log</p><h2>Recent content posts</h2></div><span>{data.posts.length} shown</span></div>
        <div className="post-table">
          {data.posts.map(post => <div className="post-row" key={post.id}><div className="post-time"><strong>{new Date(post.scheduled_at).toLocaleDateString('en-NG',{timeZone:'Africa/Lagos',month:'short',day:'numeric'})}</strong><span>{new Date(post.scheduled_at).toLocaleTimeString('en-NG',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit'})}</span></div><div><strong>{post.post_type.replaceAll('_',' ')}</strong><small>{post.platform.replaceAll('_',' ')}</small>{post.error_message ? <em>{post.error_message}</em> : null}</div><span className={`badge status-${post.status}`}>{post.status}</span></div>)}
          {!data.posts.length ? <EmptyState>No content post records found.</EmptyState> : null}
        </div>
      </section>
    </AdminShell>
  );
}
