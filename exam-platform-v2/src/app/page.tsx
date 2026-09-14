import { getSupportDb } from '@/lib/supabase-support';
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

type ReviewItem = {
  id: number | string;
  question_id?: string | null;
  issue_type: string;
  severity: string;
  status: string;
  created_at: string;
};

type ScheduledPost = {
  id: string;
  platform: string;
  post_type: string;
  scheduled_at: string;
  status: string;
  external_message_id?: string | null;
  error_message?: string | null;
};

type CronJob = {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
};

type DashboardPayload = {
  ok: boolean;
  metrics: Metrics;
  review: ReviewItem[];
  posts: ScheduledPost[];
  cron: CronJob[];
  distribution: {
    telegram_channel_chat_id?: string | null;
    telegram_group_chat_id?: string | null;
    timezone_name?: string | null;
    web_search_url?: string | null;
  };
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
  const { data, error } = await getSupportDb().rpc('support_v2_dashboard', { p_token: session.token });

  if (error || !data?.ok) {
    throw new Error(error?.message || 'Unable to load the V2 admin dashboard.');
  }

  const dashboard = data as DashboardPayload;
  const metrics = dashboard.metrics || ({} as Metrics);
  const reviews = dashboard.review || [];
  const posts = dashboard.posts || [];
  const cronJobs = dashboard.cron || [];
  const assignmentRate = metrics.questions
    ? Math.round((metrics.topicAssigned / metrics.questions) * 100)
    : 0;
  const publishingEnabled = cronJobs.length > 0 && cronJobs.every((job) => job.active);

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
        <MetricCard label="Auto publishing" value={publishingEnabled ? 'ON' : 'OFF'} hint={publishingEnabled ? '4 daily WAT jobs active' : 'Waiting for Telegram permissions'} />
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Content quality</p>
              <h2>Review queue</h2>
            </div>
            <span>{reviews.length} shown</span>
          </div>
          <div className="list">
            {reviews.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.issue_type}</strong>
                  <small>{new Date(item.created_at).toLocaleString('en-NG')}</small>
                </div>
                <span className={`badge badge-${item.severity}`}>{item.severity}</span>
              </div>
            ))}
            {!reviews.length ? <p className="empty">No open review items.</p> : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Engagement engine</p>
              <h2>Content schedule</h2>
            </div>
            <span>{posts.length} shown</span>
          </div>
          <div className="list">
            {posts.map((post) => (
              <div className="list-row" key={post.id}>
                <div>
                  <strong>{post.post_type.replaceAll('_', ' ')}</strong>
                  <small>{post.platform.replaceAll('_', ' ')} · {new Date(post.scheduled_at).toLocaleString('en-NG')}</small>
                  {post.error_message ? <small className="error-text">{post.error_message}</small> : null}
                </div>
                <span className="badge">{post.status}</span>
              </div>
            ))}
            {!posts.length ? <p className="empty">No posts scheduled yet.</p> : null}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Distribution</p>
              <h2>Connected surfaces</h2>
            </div>
          </div>
          <div className="list">
            <div className="list-row"><div><strong>Telegram channel</strong><small>{dashboard.distribution?.telegram_channel_chat_id || 'Not configured'}</small></div></div>
            <div className="list-row"><div><strong>Discussion group</strong><small>{dashboard.distribution?.telegram_group_chat_id || 'Not configured'}</small></div></div>
            <div className="list-row"><div><strong>Web search</strong><small>{dashboard.distribution?.web_search_url || 'Not configured'}</small></div></div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Publishing clock</p>
              <h2>WAT schedule</h2>
            </div>
          </div>
          <div className="list">
            {cronJobs.map((job) => (
              <div className="list-row" key={job.jobid}>
                <div>
                  <strong>{job.jobname.replace('exam-v2-', '').replace('-wat', ' WAT')}</strong>
                  <small>{job.schedule} UTC cron</small>
                </div>
                <span className={`badge ${job.active ? 'badge-low' : 'badge-medium'}`}>{job.active ? 'active' : 'disabled'}</span>
              </div>
            ))}
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
