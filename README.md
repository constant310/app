# Exam Bank Support Console

Companion support web application for the Telegram JAMB AI Tutor.

## Features
- Secure admin/editor/reviewer login
- Dashboard for question-bank quality
- Search and filter the live question library
- Add/edit questions and choices
- Publish validation for answers and required visuals
- Upload original diagrams, tables, graphs and figures
- Shared stimulus groups for one visual used by multiple questions
- CSV/JSON bulk import
- Content review queue
- Telegram user reports
- Audit log
- Support-user management
- Password rotation

The browser uses only the Supabase publishable key. Privileged writes are enforced by token-validated PostgreSQL RPC functions. No Supabase service-role, Telegram, Groq or Cloudflare secret is exposed to the client.