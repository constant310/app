import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { adminRpc } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

type Daily = { day:string; attempts:number; accuracy:number };
type Topic = { topic_name:string; subject_name:string; attempts:number; accuracy:number };
type Subject = { subject_name:string; attempts:number; accuracy:number };
type Summary = { attempts_30d:number; unique_students_30d:number; accuracy_30d:number; avg_latency_ms:number };
type Payload = { ok:boolean; summary:Summary; daily:Daily[]; topics:Topic[]; subjects:Subject[] };

export default async function AnalyticsPage() {
  const { session, data } = await adminRpc<Payload>('support_v2_analytics');
  const maxDaily = Math.max(1, ...data.daily.map(d => d.attempts));
  return (
    <AdminShell active="analytics" title="Learning Analytics" subtitle="See how students are using the driller, where accuracy drops and which topics deserve more practice content." user={session.user}>
      <section className="stats-grid compact">
        <StatCard label="Attempts · 30 days" value={data.summary.attempts_30d || 0} />
        <StatCard label="Active students · 30 days" value={data.summary.unique_students_30d || 0} />
        <StatCard label="Accuracy · 30 days" value={`${data.summary.accuracy_30d || 0}%`} tone={(data.summary.accuracy_30d || 0) >= 60 ? 'good' : 'warn'} />
        <StatCard label="Average answer latency" value={`${data.summary.avg_latency_ms || 0} ms`} />
      </section>

      <section className="dashboard-grid">
        <article className="panel span-8">
          <div className="panel-title"><div><p className="eyebrow">14-day trend</p><h2>Question attempts</h2></div></div>
          <div className="bar-chart">
            {data.daily.map(d => <div className="bar-column" key={d.day} title={`${d.attempts} attempts · ${d.accuracy}% accuracy`}><div className="bar-track"><div className="bar-fill" style={{height:`${Math.max(4,(d.attempts/maxDaily)*100)}%`}} /></div><strong>{d.attempts}</strong><span>{new Date(`${d.day}T12:00:00`).toLocaleDateString('en-NG',{month:'short',day:'numeric'})}</span></div>)}
          </div>
        </article>
        <article className="panel span-4">
          <div className="panel-title"><div><p className="eyebrow">By subject</p><h2>Accuracy</h2></div></div>
          <div className="progress-list">
            {data.subjects.map(s => <div key={s.subject_name}><div><strong>{s.subject_name}</strong><span>{s.accuracy}% · {s.attempts} attempts</span></div><div className="progress-track"><i style={{width:`${Math.max(0,Math.min(100,s.accuracy || 0))}%`}} /></div></div>)}
            {!data.subjects.length ? <EmptyState>No 30-day attempt data yet.</EmptyState> : null}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-title"><div><p className="eyebrow">Practice demand</p><h2>Most attempted topics · 30 days</h2></div></div>
        <div className="analytics-table"><div className="analytics-head"><span>Topic</span><span>Subject</span><span>Attempts</span><span>Accuracy</span></div>{data.topics.map(t => <div className="analytics-row" key={`${t.subject_name}-${t.topic_name}`}><strong>{t.topic_name}</strong><span>{t.subject_name}</span><span>{t.attempts}</span><span className={t.accuracy < 50 ? 'low-score' : ''}>{t.accuracy}%</span></div>)}</div>
        {!data.topics.length ? <EmptyState>No topic attempt data in the last 30 days.</EmptyState> : null}
      </section>
    </AdminShell>
  );
}
