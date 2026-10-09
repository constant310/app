# Year-classification execution report — Exam Bank (2026-10-09)

Supabase project: `wsxszbdvvtowmrnxdsrp`

## Changes implemented

### 20,000 synthetic JAMB-style questions — correct year semantics

The source drafts in `exam_staging.questions` are not authenticated past papers. All **20,000** were assigned `practice_collection_year=2026` from their actual **database import timestamp** (converted to `Africa/Lagos`). Their `exam_year` remains **NULL**, `authentic_past_question=false`, and `approved_for_publication=false`.

New fields:
- `practice_collection_year`
- `year_classification_status='original_practice_not_historical'`
- `year_classification_basis='database_import_timestamp_africa_lagos'`
- `year_classified_at`

Also persisted `raw_record.classification.year` with the practice-year type, evidence basis, and an explicitly null true-JAMB-exam-year field. No arbitrary 1983–2026 exam years were attached to generated questions.

### Legacy question library — source-claimed years, kept separate

Added a private `exam_staging.historical_year_index`, pointing to existing `public.exam_questions` IDs rather than copying copyrighted question bodies:

- 3,026 existing, source-linked JAMB questions with **claimed exam years from 1983 through 2018**. These cover 30 distinct year labels. Year provenance and redistribution rights **are not independently verified**.
- 250 previously generated questions labelled `year=2026` in the *existing live question table* are distinguished as **2026 practice questions**, not historical JAMB 2026 papers, in the private index. Their original live table has not been changed.

Each indexed item records the year type, original source URL (when present), claimed exam year, practice year, subject and topic identifiers, rights status, and publication status. This does not establish permission to redistribute source material.

### Year–subject–topic lookup

Created the **private**, read-only, `security_invoker` view `exam_staging.year_subject_topic_index`. Rows expose `question_collection`, `classification_year`, `year_kind`, `year_evidence_status`, `subject`, `topic`, `subtopic`, and `question_count`. The view is **not** exposed to `anon` or `authenticated` roles, and **is not yet wired into the live Telegram year selector**.

### Verified counts

- Practice drafts: **20,000/20,000** assigned collection year 2026; 25 subjects; zero falsely assigned historic exam years, zero missing classification metadata.
- Legacy index: **3,276/3,276** rows; 3,026 source-claimed historic, 250 generated practice.
- Missing historical year labels in existing source-linked inventory between 1983 and 2026: **1996; 2005–2009; 2019–2026**. This means *the database has no source-claimed question inventory for those years*, not that JAMB held no exams.
- RLS and permission checks: private table and view grant no SELECT to `anon` or `authenticated`.

## Launch requirements

1. Obtain and validate appropriate year-specific archival sources and reuse rights. A claimed year and a URL are not independent proof the question appeared in a particular JAMB sitting.
2. Improve historical subject coverage, which currently spans only 2–3 subjects per historical year in this inventory.
3. Update the production bot's year selection to distinguish **historical year** from **practice collection year**. The current legacy table still contains 250 generated 2026 records under `year=2026`; the private sidecar identifies them safely but does not yet alter the public UI.
4. Review correctness of generated questions and syllabus alignment. Classification is not academic approval.

Run the sibling read-only SQL audit file to reproduce the classification count checks.
