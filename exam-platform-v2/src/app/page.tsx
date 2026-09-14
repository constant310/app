import { getAdminDb } from '@/lib/supabase-admin';
import { requireSupportSession } from '@/lib/support-auth';
import { logoutAction } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

type Metrics = {
  questions: number;
  topicAssigned: number;
  topics: number;
  attempts: number;
  openReviewItems: number;
  scheduledPosts: number;
  openDiscussions: number;
};

function MetricCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

export default async function DashboardPage() {
  const session = await requireSupportSession();
  const db = getAdminDb();

  const [metricsResult, reviewResult, postsResult] = await Promise.all([
    db.rpc('exam_v2_dashboard_metrics'),
    db
      .from('exam_content_review_queue')
      .select('id, issue_type, severity, status, created_at')
      .in('status', ['open', 'reviewing'])
      .order('created_at', { ascending: false })
      .limit(8),
    db
      .from('exam_content_posts')
      .select('id, platform, post_type, scheduled_at, status')
      .order('scheduled_at', { ascending: true })
      .limit(8),
  ]);

  const metrics = (metricsResult.data || {}) as Metrics;
  const assignmentRate = metrics.questions
    ? Math.round((metrics.topicAssigned / metrics.questions) * 100)
    : 0;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Exam Platform V2 · Internal Admin</p>
          <h1>Command Centre</h1>
          <p>
            Monitor the question bank, topic classification, drills, content publishing,
            review backlog and student discussions from one place.
          </p>
          {session.user.must_change_password ? (
            <p className="security-notice">Your admin account is marked for a password change. Change it before public launch.</p>
          ) : null}
        </div>
        <div className="admin-controls">
          <div className="admin-name">
            <strong>{session.user.display_name}</strong>
            <span>{session.user.role}</span>
          </div>
          <div className="status-pill">V2 Beta</div>
          <form action={logoutAction}>
            <button className="ghost-button" type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Platform metrics">
        <MetricCard label="Published questions" value={metrics.questions || 0} />
        <MetricCard label="Topic assigned" value={metrics.topicAssigned || 0} hint={`${assignmentRate}% classified`} />
        <MetricCard label="Topics & subtopics" value={metrics.topics || 0} />
        <MetricCard label="Recorded attempts" value={metrics.attempts || 0} />
        <MetricCard label="Review backlog" value={metrics.openReviewItems || 0} />
        <MetricCard label="Scheduled posts" value={metrics.scheduledPosts || 0} />
        <MetricCard label="Open discussions" value={metrics.openDiscussions || 0} />
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Content quality</p>
              <h2>Review queue</h2>
            </div>
            <span>{reviewResult.data?.length || 0} shown</span>
          </div>
          <div className="list">
            {(reviewResult.data || []).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.issue_type}</strong>
                  <small>{new Date(item.created_at).toLocaleString('en-NG')}</small>
                </div>
                <span className={`badge badge-${item.severity}`}>{item.severity}</span>
              </div>
            ))}
            {!reviewResult.data?.length ? <p className="empty">No open review items.</p> : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Engagement engine</p>
              <h2>Content schedule</h2>
            </div>
            <span>{postsResult.data?.length || 0} shown</span>
          </div>
          <div className="list">
            {(postsResult.data || []).map((post) => (
              <div className="list-row" key={post.id}>
                <div>
                  <strong>{post.post_type.replaceAll('_', ' ')}</strong>
                  <small>{post.platform.replaceAll('_', ' ')} · {new Date(post.scheduled_at).toLocaleString('en-NG')}</small>
                </div>
                <span className="badge">{post.status}</span>
              </div>
            ))}
            {!postsResult.data?.length ? <p className="empty">No posts scheduled yet.</p> : null}
          </div>
        </article>
      </section>

      <section className="panel roadmap">
        <p className="eyebrow">V2 rollout</p>
        <h2>Active build tracks</h2>
        <div className="roadmap-grid">
          <div><strong>Telegram Driller</strong><span>V2 beta deployed · scanning removed</span></div>
          <div><strong>Topic Engine</strong><span>Taxonomy live · classification in progress</span></div>
          <div><strong>Telegram Channel</strong><span>Supabase publisher ready · admin access pending</span></div>
          <div><strong>WhatsApp Channel</strong><span>Challenges queued for manual/approved publishing</span></div>
          <div><strong>Discussion Group</strong><span>Schema live · bot membership pending</span></div>
          <div><strong>Web Search</strong><span>Render SearXNG retained</span></div>
        </div>
      </section>
    </main>
  );
}
