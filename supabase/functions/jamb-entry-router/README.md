# Telegram entry router — production v1.2.1

Supabase project: `wsxszbdvvtowmrnxdsrp`  
Function: `jamb-entry-router`  
Source synchronized from the deployed version 4 on 2026-10-09.

## Authentication

This endpoint accepts Telegram webhooks, so the Edge Function has `verify_jwt=false`. It implements **custom webhook authentication** using the `x-telegram-bot-api-secret-token` header and the secret retrieved from the private database runtime configuration. Missing or malformed secrets are rejected before database access. Incorrect supplied secrets are rejected with HTTP 403. Do not remove this check.

## Resilience

The runtime-configuration lookup has bounded retries specifically for transient `JWT issued at future` errors. If it cannot load configuration, it returns HTTP 503 to permit Telegram webhook retry rather than unhandled HTTP 500.

## Verified on 2026-10-09

- GET health endpoint: HTTP 200, version 1.2.1.
- POST without secret header: HTTP 403.
- POST with incorrect secret: HTTP 403.
- Authorized no-message POST through entry and downstream routers: HTTP 200.
- Telegram getWebhookInfo returned the entry router URL and zero pending updates.
- Telegram getMe returned `@jamb123bot`.

This check does **not** replace a real Telegram student-chat test. Avoid replaying production student updates. No secret values belong in this repository.

## Content-quality mitigation (database only)

Launch-safety review on 2026-10-09 moved 2,197 published questions with confirmed answer defects and 41 additional questions with missing required visuals into `review` status. Their original publication status is preserved in `bot_private.launch_content_quarantine` for controlled, reviewed rollback. Never republish these items automatically before answers, figures and reuse rights are verified.
