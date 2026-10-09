-- Read-only validation of the private, original JAMB-style draft collection.
-- Supabase project wsxszbdvvtowmrnxdsrp
SELECT
 count(*) AS total,
 count(DISTINCT id) AS unique_ids,
 count(DISTINCT subject) AS subjects,
 count(DISTINCT topic) AS broad_topics,
 count(DISTINCT subtopic) AS subtopics,
 count(DISTINCT (subject,topic,subtopic)) AS subject_topic_subtopic_groups,
 count(*) FILTER (WHERE classification_status='pending_teacher_review'
   AND classification_version='curated_family_rule_v1') AS classified,
 count(*) FILTER (WHERE topic IS NULL OR subtopic IS NULL
   OR difficulty_score IS NULL OR bloom_level IS NULL OR estimated_seconds IS NULL
   OR question_format IS NULL OR skill_tag IS NULL OR classification_confidence IS NULL)
 AS missing_classification_fields,
 count(*) FILTER (WHERE authentic_past_question OR exam_year IS NOT NULL
   OR approved_for_publication OR answer_review_status<>'needs_review')
 AS unsafe_year_review_or_publication_claims
FROM exam_staging.questions;

SELECT subject,count(*) questions,count(DISTINCT topic) topics,count(DISTINCT subtopic) subtopics
FROM exam_staging.questions GROUP BY subject ORDER BY subject;

SELECT question_format, difficulty_score, count(*) questions
FROM exam_staging.questions
GROUP BY question_format,difficulty_score ORDER BY question_format,difficulty_score;

SELECT count(*) AS rule_count,
       count(DISTINCT subject) AS subjects
FROM exam_staging.classification_taxonomy;

SELECT count(*) AS missing_taxonomy_rule
FROM exam_staging.questions q
LEFT JOIN exam_staging.classification_taxonomy t
  ON t.subject=q.subject AND t.item_family=q.raw_record->>'item_family'
 AND t.source_topic=q.topic
WHERE t.subject IS NULL;
