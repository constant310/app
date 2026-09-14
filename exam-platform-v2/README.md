# Exam Platform V2 — Admin Command Centre

The V2 web application is an **internal admin/control-centre only**. Students do not use this web app for normal practice.

## Production architecture

- **Vercel / Next.js** — private admin command centre: overview, question bank, review queue, publishing controls, discussions, analytics and system health.
- **Supabase Exam Bank** — questions, topics/subtopics, attempts, schedules, discussions, support/admin sessions, Telegram bot Edge Functions and content publisher.
- **Telegram Bot (`@jamb123bot`)** — student drills, topic practice, mocks, progress and AI tutoring.
- **Telegram Channel (`@jamblink`)** — daily quiz challenges and scheduled answers/explanations.
- **Telegram Group (`@jamblink1`)** — student discussion/escalation when the bot explanation is not enough.
- **WhatsApp Channel** — acquisition and share-ready daily challenges linking students into the bot/ecosystem.
- **Render** — retained only for SearXNG web-search fallback.

## Admin modules

- Overview / Command Centre
- Question Bank — search, topic corrections, public-channel verification
- Review Queue — quality issues with resolution workflow
- Publishing — daily schedule generation, Telegram readiness and cron controls
- Discussions — student escalation tracking and resolution
- Analytics — attempts, active students, accuracy, subject/topic trends
- System Health — data-quality gates, service connectivity and admin audit log

## Security model

- Uses the existing Exam Bank support/admin accounts.
- Admin session token is stored in an HTTP-only cookie.
- Browser code uses only the Supabase publishable key.
- Privileged reads and writes go through token-gated RPCs.
- No Supabase service-role key or Telegram bot token is exposed to Vercel/browser clients.
- Admin pages are no-index/no-follow and redirect unauthenticated users to `/login`.

## Vercel root directory

When importing `constant310/app`, use:

`exam-platform-v2`

## Environment

The app can use the values in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Both are public client configuration values; private bot/publisher credentials remain in Supabase.

## Publishing schedule

Publishing itself runs from the existing Supabase scheduler/publisher at WAT slots:

- 07:00 — Question 1
- 12:00 — Answer/explanation 1
- 16:00 — Question 2
- 20:00 — Answer/explanation 2

The Vercel admin app controls and monitors this system; it does not hold the Telegram bot token.
