import { AdminShell, EmptyState } from '@/app/components/admin-shell';
import { setQuestionTopicAction, setQuestionVerifiedAction } from '@/app/actions/admin';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Question = { id:string; exam_body_slug:string; year:number|null; question_number:string|null; stem:string; answer_text:string|null; explanation:string|null; content_status:string; topic_id:string|null; updated_at:string; subject_slug:string; subject_name:string; topic_name:string|null; topic_slug:string|null; parent_topic_name:string|null; channel_verified:boolean; topic_assignment_method:string|null; open_review_count:number };
type Topic = { id:string; name:string; slug:string; subject_slug:string; parent_name:string|null };
type Subject = { slug:string; name:string };
type Payload = { ok:boolean; total:number; items:Question[]; subjects:Subject[]; topics:Topic[]; limit:number; offset:number };
type Props = { searchParams: Promise<{ q?:string; subject?:string; status?:string; verified?:string; page?:string }> };

export default async function QuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1) || 1);
  const limit = 30;
  const verified = params.verified === 'true' ? true : params.verified === 'false' ? false : null;
  const { session, data } = await adminRpc<Payload>('support_v2_questions', {
    p_search: params.q || null,
    p_subject: params.subject || null,
    p_status: params.status || null,
    p_verified: verified,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });
  const pages = Math.max(1, Math.ceil(data.total / limit));

  return (
    <AdminShell active="questions" title="Question Bank" subtitle="Search the Exam Bank, correct taxonomy and decide what is safe for automated public challenges." user={session.user}>
      <section className="panel filter-panel">
        <form className="filter-form">
          <label className="search-field"><span>Search</span><input name="q" defaultValue={params.q || ''} placeholder="Question text or question number" /></label>
          <label><span>Subject</span><select name="subject" defaultValue={params.subject || ''}><option value="">All subjects</option>{data.subjects.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label><span>Status</span><select name="status" defaultValue={params.status || ''}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="review">Review</option><option value="rejected">Rejected</option></select></label>
          <label><span>Channel</span><select name="verified" defaultValue={params.verified || ''}><option value="">All</option><option value="true">Verified</option><option value="false">Not verified</option></select></label>
          <button className="primary-button" type="submit">Filter</button>
        </form>
      </section>

      <div className="section-summary"><strong>{data.total.toLocaleString()} questions</strong><span>Page {page} of {pages}</span></div>

      <section className="question-list">
        {data.items.map((q) => {
          const topics = data.topics.filter(t => t.subject_slug === q.subject_slug);
          return <article className="question-card" key={q.id}>
            <div className="question-topline">
              <div className="chip-row"><span className="chip strong">{q.subject_name}</span><span className="chip">{q.exam_body_slug?.toUpperCase() || 'EXAM'} {q.year || ''}</span>{q.question_number ? <span className="chip">Q{q.question_number}</span> : null}<span className={`chip ${q.channel_verified ? 'success' : 'muted'}`}>{q.channel_verified ? 'Channel verified' : 'Not verified'}</span>{q.open_review_count > 0 ? <span className="chip danger">{q.open_review_count} review issue{q.open_review_count === 1 ? '' : 's'}</span> : null}</div>
              <span className="tiny-id">{q.id.slice(0,8)}</span>
            </div>
            <h2>{q.stem}</h2>
            <div className="question-details"><div><span>Stored answer</span><strong>{q.answer_text || '—'}</strong></div><div><span>Topic</span><strong>{q.parent_topic_name ? `${q.parent_topic_name} → ` : ''}{q.topic_name || 'Unclassified'}</strong></div><div><span>Assignment</span><strong>{q.topic_assignment_method || '—'}</strong></div></div>
            {q.explanation ? <p className="question-explanation"><b>Explanation:</b> {q.explanation}</p> : <p className="question-explanation missing">No stored explanation.</p>}
            <div className="question-actions">
              <form action={setQuestionTopicAction} className="inline-form grow"><input type="hidden" name="questionId" value={q.id} /><select name="topicId" defaultValue={q.topic_id || ''}><option value="">Unclassified</option>{topics.map(t=><option key={t.id} value={t.id}>{t.parent_name ? `${t.parent_name} → ` : ''}{t.name}</option>)}</select><button className="secondary-button" type="submit">Save topic</button></form>
              <form action={setQuestionVerifiedAction}><input type="hidden" name="questionId" value={q.id} /><input type="hidden" name="verified" value={q.channel_verified ? 'false' : 'true'} /><button className={q.channel_verified ? 'danger-button' : 'primary-button'} type="submit">{q.channel_verified ? 'Remove verification' : 'Verify for channel'}</button></form>
            </div>
          </article>;
        })}
        {!data.items.length ? <EmptyState>No questions match these filters.</EmptyState> : null}
      </section>

      <nav className="pager" aria-label="Question pagination">
        {page > 1 ? <a href={`?${new URLSearchParams({...params,page:String(page-1)} as Record<string,string>).toString()}`}>← Previous</a> : <span />}
        <span>{page} / {pages}</span>
        {page < pages ? <a href={`?${new URLSearchParams({...params,page:String(page+1)} as Record<string,string>).toString()}`}>Next →</a> : <span />}
      </nav>
    </AdminShell>
  );
}
