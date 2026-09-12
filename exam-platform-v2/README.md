# Exam Platform V2

V2 combines a Telegram drilling bot, Supabase Exam Bank, admin/monitoring web app, scheduled Telegram Channel content, WhatsApp Channel preparation, and Telegram Group discussion workflows.

## Current V2 architecture

- **Vercel / Next.js** — admin dashboard, monitoring, content scheduler and cron trigger.
- **Supabase** — question bank, topics/subtopics, attempts, content schedule, discussion records and Telegram bot Edge Functions.
- **Telegram Bot** — main driller and AI tutor.
- **Telegram Channel** — scheduled challenge/answer posts.
- **WhatsApp Channel** — challenge content queue; direct publishing adapter remains separate until an approved integration is configured.
- **Telegram Group** — discussion/escalation for questions students still do not understand.
- **Render** — retained only for the existing SearXNG web-search fallback.

## V2 bot

The parallel Supabase Edge Function is `exam-bot-v2`.

Changes from V1:

- Image/OCR question scanning removed.
- Year drilling retained.
- Topic drilling added.
- Topic/subtopic labels included in question payloads.
- Random subject drilling retained.
- Attempts are recorded.
- AI is used for explanations and follow-up tutoring rather than every question interaction.

## Vercel root directory

When creating the Vercel project from `constant310/app`, set the Root Directory to:

`exam-platform-v2`

## Required environment variables

Copy `.env.example` into the Vercel project settings and provide the values through encrypted environment variables. Never commit live tokens or service-role keys.

## Content schedule

The Vercel cron trigger checks the publishing queue at:

- 06:00 UTC / 07:00 WAT
- 11:00 UTC / 12:00 WAT
- 15:00 UTC / 16:00 WAT
- 19:00 UTC / 20:00 WAT

Only due rows in `exam_content_posts` with status `approved` or `scheduled` are processed.
