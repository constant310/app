import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Quality = { published_questions:number; channel_verified:number; missing_topic:number; missing_answer:number; missing_explanation:number };
type Config = { telegram_channel_chat_id?:string|null; telegram_group_chat_id?:string|null; timezone_name?:string|null; web_search_url?:string|null; telegram_channel_ready?:boolean; telegram_group_ready?:boolean; telegram_verified_at?:string|null; telegram_health?:Record<string,unknown>|null };
type Audit = { id:number; action:string; entity_type:string; entity_id:string|null; details:Record<string,unknown>|null; created_at:string; display_name:string };
type Payload = { ok:boolean; quality:Quality; audit:Audit[]; config:Config };

export default async function SystemPage() {
  const { session, data } = await adminRpc<Payload>('support_v2_system');
  const ready = Boolean(data.config.telegram_channel_ready && data.config.telegram_group_ready);
  return (
    <AdminShell active="system" title="System Health" subtitle="Quality gates, distribution connectivity and recent admin audit activity for the live Exam Bank." user={session.user}>
      <section className="stats-grid compact">
        <StatCard label="Published questions" value={data.quality.published_questions || 0} />
        <StatCard label="Channel verified" value={data.quality.channel_verified || 0} tone="good" />
        <StatCard label="Missing topic" value={data.quality.missing_topic || 0} tone={(data.quality.missing_topic || 0) ? 'warn' : 'good'} />
        <StatCard label="Missing answer" value={data.quality.missing_answer || 0} tone={(data.quality.missing_answer || 0) ? 'danger' : 'good'} />
        <StatCard label="Missing explanation" value={data.quality.missing_explanation || 0} tone={(data.quality.missing_explanation || 0) ? 'warn' : 'good'} />
      </section>

      <section className="dashboard-grid">
        <article className="panel span-6">
          <div className="panel-title"><div><p className="eyebrow">Distribution</p><h2>Connected services</h2></div><span className={`status-pill ${ready ? 'success' : 'warn'}`}>{ready ? 'Telegram ready' : 'Needs attention'}</span></div>
          <div className="system-list">
            <div><span>Telegram challenge channel</span><strong>{data.config.telegram_channel_chat_id || 'Not configured'}</strong><b className={data.config.telegram_channel_ready ? 'ok-text' : 'warn-text'}>{data.config.telegram_channel_ready ? 'Ready' : 'Not ready'}</b></div>
            <div><span>Telegram discussion group</span><strong>{data.config.telegram_group_chat_id || 'Not configured'}</strong><b className={data.config.telegram_group_ready ? 'ok-text' : 'warn-text'}>{data.config.telegram_group_ready ? 'Ready' : 'Not ready'}</b></div>
            <div><span>Search fallback</span><strong>Render · SearXNG</strong><b className="ok-text">Configured</b></div>
            <div><span>Timezone</span><strong>{data.config.timezone_name || 'Africa/Lagos'}</strong><b className="ok-text">WAT</b></div>
          </div>
          {data.config.telegram_verified_at ? <p className="verification-time">Last Telegram health verification: {new Date(data.config.telegram_verified_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</p> : null}
        </article>

        <article className="panel span-6">
          <div className="panel-title"><div><p className="eyebrow">Architecture</p><h2>Production responsibilities</h2></div></div>
          <div className="architecture-list">
            <div><strong>Vercel admin</strong><span>Internal control centre only</span></div>
            <div><strong>Supabase Exam Bank</strong><span>Questions, topics, attempts, schedules, discussions</span></div>
            <div><strong>Telegram bot</strong><span>Student drills, mocks and AI tutor</span></div>
            <div><strong>Telegram channel</strong><span>Daily quiz distribution</span></div>
            <div><strong>Telegram group</strong><span>Student discussion escalation</span></div>
            <div><strong>WhatsApp channel</strong><span>Acquisition and share-ready challenge links</span></div>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><div><p className="eyebrow">Security & operations</p><h2>Recent admin audit trail</h2></div><span>{data.audit.length} events</span></div>
        <div className="audit-list">{data.audit.map(event => <div className="audit-row" key={event.id}><div className="audit-icon">•</div><div><strong>{event.action.replaceAll('_',' ')}</strong><small>{event.display_name} · {event.entity_type}{event.entity_id ? ` · ${event.entity_id.slice(0,12)}` : ''}</small></div><time>{new Date(event.created_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</time></div>)}{!data.audit.length ? <EmptyState>No admin audit events found.</EmptyState> : null}</div>
      </section>
    </AdminShell>
  );
}
