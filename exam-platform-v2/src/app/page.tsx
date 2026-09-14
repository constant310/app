import Link from 'next/link';
import { AdminShell, EmptyState, StatCard } from '@/app/components/admin-shell';
import { adminRpc } from '@/lib/admin-data';

type Metrics = { questions:number; topicAssigned:number; topics:number; attempts:number; openReviewItems:number; scheduledPosts:number; openDiscussions:number };
type ReviewItem = { id:number|string; issue_type:string; severity:string; status:string; created_at:string };
type ScheduledPost = { id:string; platform:string; post_type:string; scheduled_at:string; status:string; error_message?:string|null };
type CronJob = { jobid:number; jobname:string; schedule:string; active:boolean };
type Distribution = { telegram_channel_chat_id?:string|null; telegram_group_chat_id?:string|null; timezone_name?:string|null; web_search_url?:string|null; telegram_channel_ready?:boolean; telegram_group_ready?:boolean; telegram_verified_at?:string|null };
type DashboardPayload = { ok:boolean; metrics:Metrics; review:ReviewItem[]; posts:ScheduledPost[]; cron:CronJob[]; distribution:Distribution };

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { session, data } = await adminRpc<DashboardPayload>('support_v2_dashboard');
  const metrics = data.metrics || ({} as Metrics);
  const reviews = data.review || [];
  const posts = data.posts || [];
  const cronJobs = data.cron || [];
  const distribution = data.distribution || {};
  const assignmentRate = metrics.questions ? Math.round((metrics.topicAssigned / metrics.questions) * 100) : 0;
  const publishingEnabled = cronJobs.length > 0 && cronJobs.every((job) => job.active);
  const telegramReady = Boolean(distribution.telegram_channel_ready && distribution.telegram_group_ready);

  return (
    <AdminShell active="overview" title="Command Centre" subtitle="One operational view of content quality, student activity, publishing and platform health." user={session.user}>
      <section className="stats-grid">
        <StatCard label="Published questions" value={metrics.questions || 0} hint="Exam Bank content" />
        <StatCard label="Topic coverage" value={`${assignmentRate}%`} hint={`${(metrics.topicAssigned || 0).toLocaleString()} classified`} tone={assignmentRate >= 80 ? 'good' : 'warn'} />
        <StatCard label="Review backlog" value={metrics.openReviewItems || 0} hint="Open quality checks" tone={(metrics.openReviewItems || 0) > 0 ? 'danger' : 'good'} />
        <StatCard label="Student attempts" value={metrics.attempts || 0} hint="Recorded answers" />
        <StatCard label="Scheduled posts" value={metrics.scheduledPosts || 0} hint="Channel content queue" />
        <StatCard label="Open discussions" value={metrics.openDiscussions || 0} hint="Student escalations" tone={(metrics.openDiscussions || 0) > 0 ? 'warn' : 'good'} />
      </section>

      <section className="health-strip">
        <div><span className={telegramReady ? 'health-dot good' : 'health-dot warn'} /><strong>Telegram</strong><small>{telegramReady ? 'Channel + group verified' : 'Permissions need attention'}</small></div>
        <div><span className={publishingEnabled ? 'health-dot good' : 'health-dot warn'} /><strong>Auto publishing</strong><small>{publishingEnabled ? 'Four WAT jobs active' : 'Publishing jobs disabled'}</small></div>
        <div><span className="health-dot good" /><strong>Exam Bank</strong><small>{(metrics.topics || 0).toLocaleString()} topics/subtopics</small></div>
        <div><span className="health-dot good" /><strong>Web search</strong><small>Render SearXNG retained</small></div>
      </section>

      <section className="dashboard-grid">
        <article className="panel span-7">
          <div className="panel-title"><div><p className="eyebrow">Content quality</p><h2>Priority review queue</h2></div><Link href="/reviews">Open queue →</Link></div>
          <div className="table-list">
            {reviews.slice(0, 6).map((item) => <div className="table-row" key={item.id}><div><strong>{item.issue_type.replaceAll('_',' ')}</strong><small>{new Date(item.created_at).toLocaleString('en-NG')}</small></div><span className={`badge severity-${item.severity}`}>{item.severity}</span></div>)}
            {!reviews.length ? <EmptyState>No open review items.</EmptyState> : null}
          </div>
        </article>

        <article className="panel span-5">
          <div className="panel-title"><div><p className="eyebrow">Publishing</p><h2>Next content</h2></div><Link href="/publishing">Manage →</Link></div>
          <div className="timeline-list">
            {posts.slice(0, 6).map((post) => <div className="timeline-item" key={post.id}><span className={`timeline-dot status-${post.status}`} /><div><strong>{post.post_type.replaceAll('_',' ')}</strong><small>{post.platform.replaceAll('_',' ')} · {new Date(post.scheduled_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})}</small>{post.error_message ? <em>{post.error_message}</em> : null}</div><span className="badge">{post.status}</span></div>)}
            {!posts.length ? <EmptyState>No content scheduled yet.</EmptyState> : null}
          </div>
        </article>

        <article className="panel span-12">
          <div className="panel-title"><div><p className="eyebrow">Admin workflow</p><h2>What needs attention</h2></div></div>
          <div className="action-grid">
            <Link href="/questions"><strong>Question Bank</strong><span>Search questions, correct topics and control channel verification.</span><b>Open →</b></Link>
            <Link href="/reviews"><strong>Quality Review</strong><span>Work critical and high-severity content issues before public use.</span><b>Review →</b></Link>
            <Link href="/discussions"><strong>Student Discussions</strong><span>Track questions students escalated from the bot into the group.</span><b>Resolve →</b></Link>
            <Link href="/analytics"><strong>Learning Analytics</strong><span>See accuracy, activity and difficult subjects/topics.</span><b>Analyse →</b></Link>
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
