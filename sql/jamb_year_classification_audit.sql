-- Read-only validation for the Exam Bank provenance-aware year classification
-- 2026-10-09, Supabase project wsxszbdvvtowmrnxdsrp
SELECT count(*) AS drafts,
       count(DISTINCT id) AS unique_draft_ids,
       count(DISTINCT subject) AS subjects,
       count(*) FILTER(WHERE practice_collection_year=2026
           AND year_classification_status='original_practice_not_historical') AS correctly_year_classified,
       count(*) FILTER(WHERE exam_year IS NOT NULL OR authentic_past_question OR
           year_evidence_url IS NOT NULL OR approved_for_publication) AS false_historical_or_published_flags,
       count(*) FILTER(WHERE year_classification_basis IS NULL OR
           year_classified_at IS NULL OR raw_record->'classification'->'year' IS NULL) AS missing_year_metadata
FROM exam_staging.questions;

SELECT year_label_type,year_evidence_status,count(*) AS records,
       count(DISTINCT claimed_exam_year) AS claimed_years,
       min(claimed_exam_year) AS earliest_claimed,
       max(claimed_exam_year) AS latest_claimed,
       count(*) FILTER(WHERE source_url IS NULL
           AND year_label_type='source_claimed_historical_exam_year') AS source_link_missing
FROM exam_staging.historical_year_index
GROUP BY year_label_type,year_evidence_status;

SELECT classification_year,question_collection,year_kind,sum(question_count) AS questions
FROM exam_staging.year_subject_topic_index
GROUP BY classification_year,question_collection,year_kind
ORDER BY classification_year DESC,question_collection;

SELECT y AS historical_year_without_source_linked_records
FROM generate_series(1983,2026) y
WHERE NOT EXISTS (
 SELECT 1 FROM exam_staging.historical_year_index i
 WHERE i.claimed_exam_year=y
) ORDER BY y;

SELECT n.nspname,c.relname,has_table_privilege('anon',c.oid,'SELECT') AS anon_read,
       has_table_privilege('authenticated',c.oid,'SELECT') AS logged_in_read
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='exam_staging' AND c.relname IN
('questions','historical_year_index','year_subject_topic_index');
