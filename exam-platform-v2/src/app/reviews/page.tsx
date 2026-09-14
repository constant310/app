import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { setReviewStatusAction } from '@/app/actions/admin';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Review = { id:number; question_id:string|null; issue_type:string; severity:string; status:string; detected_by:string|null; details:Record<string,unknown>|null; created_at:string; resolved_at:string|null; stem:string|null; answer_text:string|null; subject_name:string|null; subject_slug:string|null; topic_name:string|null };
type Payload = { ok:boolean; total:number; items:Review[]; summary:Record<string,number> };
type Props = { searchParams: Promise<{ status?:string; severity?:string }> };

export default async function ReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { session, data } = await adminRpc<Payload>('support_v2_reviews', { p_status: params.status || null, p_severity: params.severity || null, p_limit: 50, p_offset: 0 });
  return (
    <AdminShell active="reviews" title="Content Review" subtitle="Work the quality backlog before questions become trusted public challenge content." user={session.user}>
      <section className="stats-grid compact">
        <StatCard label="Open in filter" value={data.total} />
        <StatCard label="Critical open" value={data.summary?.critical || 0} tone={(data.summary?.critical || 0) ? 'danger' : 'good'} />
        <StatCard label="High open" value={data.summary?.high || 0} tone={(data.summary?.high || 0) ? 'warn' : 'good'} />
      </section>
      <section className="panel filter-panel">
        <form className="filter-form short">
          <label><span>Status</span><select name="status" defaultValue={params.status || 'open'}><option value="">All</option><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></label>
          <label><span>Severity</span><select name="severity" defaultValue={params.severity || ''}><option value="">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
          <button className="primary-button" type="submit">Apply</button>
        </form>
      </section>
      <section className="review-list">
        {data.items.map(item => <article className="review-card" key={item.id}>
          <div className="review-heading"><div className="chip-row"><span className={`badge severity-${item.severity}`}>{item.severity}</span><span className="chip">{item.status}</span><span className="chip">{item.subject_name || 'Unknown subject'}</span>{item.topic_name ? <span className="chip">{item.topic_name}</span> : null}</div><small>{new Date(item.created_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</small></div>
          <h2>{item.issue_type.replaceAll('_',' ')}</h2>
          <p className="review-stem">{item.stem || 'Question record unavailable.'}</p>
          {item.answer_text ? <p className="stored-answer"><span>Stored answer</span><strong>{item.answer_text}</strong></p> : null}
          {item.details && Object.keys(item.details).length ? <pre className="details-box">{JSON.stringify(item.details,null,2)}</pre> : null}
          <div className="button-row">
            {item.status !== 'reviewing' ? <form action={setReviewStatusAction}><input type="hidden" name="reviewId" value={item.id}/><input type="hidden" name="status" value="reviewing"/><button className="secondary-button" type="submit">Start review</button></form> : null}
            {item.status !== 'resolved' ? <form action={setReviewStatusAction}><input type="hidden" name="reviewId" value={item.id}/><input type="hidden" name="status" value="resolved"/><button className="primary-button" type="submit">Mark resolved</button></form> : null}
            {item.status !== 'dismissed' ? <form action={setReviewStatusAction}><input type="hidden" name="reviewId" value={item.id}/><input type="hidden" name="status" value="dismissed"/><button className="ghost-button" type="submit">Dismiss</button></form> : null}
          </div>
        </article>)}
        {!data.items.length ? <EmptyState>No review items match this filter.</EmptyState> : null}
      </section>
    </AdminShell>
  );
}
