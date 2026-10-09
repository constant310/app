-- Read-only check of year attribution and repeated historical exam-question stems.
-- Project: wsxszbdvvtowmrnxdsrp

SELECT
  (SELECT count(*) FROM exam_staging.question_year_occurrences WHERE source_provider='Existing Exam Bank user upload') AS archive_year_claims,
  (SELECT count(*) FROM exam_staging.question_year_occurrences WHERE evidence_level='external_provider_label_confirmed') AS external_provider_confirmed_labels,
  (SELECT count(*) FROM exam_staging.question_year_occurrences WHERE evidence_level='possible_variant_needs_review') AS possible_variants,
  (SELECT count(*) FROM exam_staging.repeated_question_review_queue) AS repeated_groups,
  (SELECT count(*) FROM exam_staging.questions WHERE exam_year IS NOT NULL) AS generated_questions_mislabelled_with_historical_year;

SELECT subject,example_question_text,claimed_years,compared_records,
       repeat_classification,independent_provider_year_evidence,review_status
FROM exam_staging.repeated_question_review_queue
ORDER BY independent_provider_year_evidence DESC,subject,example_question_text;

SELECT q.existing_question_id,q.draft_question_id,q.subject_name,q.year,q.source_provider,
       q.source_url,q.match_relation,q.evidence_level,q.checked_at
FROM exam_staging.question_year_occurrences q
WHERE q.evidence_level IN ('external_provider_label_confirmed','possible_variant_needs_review')
ORDER BY q.subject_name,q.canonical_stem_key,q.year,q.source_provider;

WITH draft AS (
 SELECT id,lower(subject) AS subject,
        regexp_replace(lower(question_text),'[^a-z0-9]+','','g') AS norm
 FROM exam_staging.questions
), archive AS (
 SELECT q.id,lower(s.name) AS subject,
        regexp_replace(lower(q.stem),'[^a-z0-9]+','','g') AS norm
 FROM public.exam_questions q
 JOIN public.exam_subjects s ON s.id=q.subject_id
 WHERE q.exam_body_slug='jamb' AND q.rights_status='user_provided_unverified'
)
SELECT count(*) AS exact_text_matches_between_generated_drafts_and_archive
FROM draft JOIN archive USING (subject,norm);
