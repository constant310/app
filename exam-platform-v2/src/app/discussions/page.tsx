import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { setDiscussionStatusAction } from '@/app/actions/admin';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Discussion = { id:string; question_id:string|null; external_user_id:string|null; telegram_chat_id:string|null; telegram_thread_id:string|null; student_issue:string; status:string; accepted_message_id:string|null; created_at:string; resolved_at:string|null; metadata:Record<string,unknown>|null; stem:string|null; answer_text:string|null; subject_name:string|null; subject_slug:string|null; topic_name:string|null };
type Payload = { ok:boolean; total:number; items:Discussion[] };
type Props = { searchParams: Promise<{ status?:string }> };

export default async function DiscussionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { session, data } = await adminRpc<Payload>('support_v2_discussions', { p_status: params.status || null, p_limit: 50, p_offset: 0 });
  const open = data.items.filter(d => d.status === 'open').length;
  const answered = data.items.filter(d => d.status === 'answered').length;
  return (
    <AdminShell active="discussions" title="Student Discussions" subtitle="Monitor questions escalated from the bot and close the loop when students need community or teacher help." user={session.user}>
      <section className="stats-grid compact">
        <StatCard label="Matching discussions" value={data.total} />
        <StatCard label="Open shown" value={open} tone={open ? 'warn' : 'good'} />
        <StatCard label="Answered shown" value={answered} tone="good" />
      </section>
      <section className="panel filter-panel">
        <form className="filter-form short"><label><span>Status</span><select name="status" defaultValue={params.status || ''}><option value="">All discussions</option><option value="open">Open</option><option value="answered">Answered</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label><button className="primary-button" type="submit">Apply</button></form>
      </section>
      <section className="discussion-list">
        {data.items.map(item => <article className="discussion-card" key={item.id}>
          <div className="review-heading"><div className="chip-row"><span className={`chip ${item.status === 'open' ? 'danger' : 'success'}`}>{item.status}</span><span className="chip">{item.subject_name || 'Unknown subject'}</span>{item.topic_name ? <span className="chip">{item.topic_name}</span> : null}</div><small>{new Date(item.created_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</small></div>
          <h2>{item.student_issue || 'Student requested help.'}</h2>
          {item.stem ? <blockquote>{item.stem}</blockquote> : null}
          <div className="discussion-meta"><span>User <b>{item.external_user_id || 'unknown'}</b></span>{item.telegram_chat_id ? <span>Chat <b>{item.telegram_chat_id}</b></span> : null}{item.telegram_thread_id ? <span>Thread <b>{item.telegram_thread_id}</b></span> : null}</div>
          <div className="button-row">
            {item.status !== 'answered' ? <form action={setDiscussionStatusAction}><input type="hidden" name="discussionId" value={item.id}/><input type="hidden" name="status" value="answered"/><button className="secondary-button" type="submit">Mark answered</button></form> : null}
            {item.status !== 'resolved' ? <form action={setDiscussionStatusAction}><input type="hidden" name="discussionId" value={item.id}/><input type="hidden" name="status" value="resolved"/><button className="primary-button" type="submit">Resolve</button></form> : null}
            {item.status !== 'closed' ? <form action={setDiscussionStatusAction}><input type="hidden" name="discussionId" value={item.id}/><input type="hidden" name="status" value="closed"/><button className="ghost-button" type="submit">Close</button></form> : null}
          </div>
        </article>)}
        {!data.items.length ? <EmptyState>No student discussions match this filter yet.</EmptyState> : null}
      </section>
    </AdminShell>
  );
}
