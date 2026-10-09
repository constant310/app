# Year-by-year JAMB question occurrences — 9 October 2026

## Purpose

Keep **year occurrences** separate from question identity, because a single question can be independently listed against two or more past years. Never overwrite an existing year with a later provider's claim or duplicate text needlessly.

Supabase project: `wsxszbdvvtowmrnxdsrp`.

### Database tables

- `exam_staging.question_year_occurrences`: one linked question + claimed year + source provider + URL per row. Supports existing historical `public.exam_questions.id` (UUID), as well as draft question `exam_staging.questions.id` (text). Evidence levels distinguish uploaded years from externally confirmed **provider labels** and authenticated official exam sittings.
- `exam_staging.question_year_repeat_candidates`: view grouping identical normalized stems by subject across different claimed years.
- `exam_staging.repeated_question_review_queue`: stored candidate list, year array, IDs, option consistency, image/passage dependency, and evidence count, awaiting review.
- Previous `exam_staging.year_match_evidence` and `exam_staging.year_comparison_runs` remain untouched.

### Audit

- Existing year-labelled user-uploaded JAMB archive: **3,026 occurrence rows**; these are `internal_year_claim_unverified`, not independent proof of JAMB sitting.
- Targeted external metadata comparison: **13 question-source-year links** whose **provider listings** were checked; **one possible wording variant** needing manual review. These 14 links reference Myschool, SchoolNGR, EduPadi, Ulearngo, Quizzerweb, SSCEquiz and other public providers. They contain only source references, not republished third-party question datasets.
- **28** repeated-stem groups covering **58** existing historical records. Of these, **13** groups share normalized answer-choice sets, **12** have different answer-choice sets, and **3** need supporting visual/passage context.
- Examples with external provider evidence: Biology, whale flippers/fish fins (archive claims 2010 and 2018); Literature, poetry metre (2012 and 2018); Literature, symbolism/allegory (2012 and 2018). Different providers can repeat a wrongly labelled exam paper, so confirmation of provider listings is not JAMB authentication.
- All **20,000 original AI-generated draft questions** compared for exact normalized text identity against the 3,026 archived historical records, with subject alignment: **0 exact matches**. No draft question is assigned a historical examination year.
- Myschool separately labels the short Biology question about water-carrying plant tissue as **2013** and a wording/option variant as **2018**; the latter is stored as `possible_variant_needs_review` and excluded from exact-repeat detection.

### Historical year assignment rule

Assign a historical exam year to a draft only after a substantive exact/near-exact review of the question, answer options and relevant figures/passages, backed by a source URL and permitted reuse rights. For multi-year appearance, store one occurrence per (question, year, provider, source), rather than setting a single scalar exam year. Separately distinguish publisher claims from original exam-board authenticated papers.

**DO NOT** copy Myschool/ALOC/SdashAPI question banks wholesale into this open-source product without appropriate redistribution rights. Myschool terms prohibit reproducing proprietary content without permission; standard ALOC API terms prohibit permanent bulk replication and redistribution. Open-source software/API repository licenses do not necessarily license the exam content.

### Next

1. Review 28 duplicate groups, particularly those with different options, missing images, generic stems and cross-year paper duplication.
2. Secure a licensed historical past-paper corpus with reliable source-specific IDs, exam-year metadata, and reuse rights.
3. Import question-year-provider occurrence metadata (and permitted content) in batches.
4. Run normalized exact + fuzzy candidate matching, **human review** with answer/diagram alignment, and only then promote trusted historical occurrences to the student bot.
5. Keep the 20,000 original draft questions in their existing collection as yearless practice material.

Useful sources:
- https://myschool.ng/classroom/biology/29626 (2010)
- https://app.ulearngo.com/past-questions/biology/jamb?year=2018
- https://myschool.ng/classroom/literature-in-english/30462 (2012)
- https://quizzerweb.genioforge.org/study/73/literature-in-english-2018/1
- https://myschool.ng/terms-of-use
- https://aloc.com.ng/terms
