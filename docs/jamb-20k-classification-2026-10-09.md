# JAMB-style question classification — 9 October 2026

## Status: all 20,000 original drafts classified in the existing Supabase Exam Bank

Supabase project: `wsxszbdvvtowmrnxdsrp`  
Private questions: `exam_staging.questions`  
Rule catalogue: `exam_staging.classification_taxonomy`

### Audited result

- **20,000 / 20,000** draft questions classified, 800 in each of 25 subjects.
- **137** distinct broad topic labels and **163** distinct subtopic labels across **165** subject/topic/subtopic combinations.
- **159** reusable subject + generator-family + original-topic rules.
- Five multiple-choice formats: contextual numerical (11,200), paired translation (4,000), paired facts (3,200), figure-of-speech identification (800), grammar completion (800).
- Difficulty estimates: tier 1 = 913, tier 2 = 17,536, tier 3 = 1,551. **These tiers are heuristic, not psychometrically validated.** Difficulty tiers 4/5 were intentionally not manufactured.
- Exact terms extracted from questions for 7,200 paired-word and paired-fact records; stored in `raw_record.classification.source_terms`.
- All 800 literature questions tagged with one of seven provisional figures-of-speech labels derived from their *unreviewed* answer keys.
- No records are missing topic, subtopic, estimated difficulty, cognitive level, estimated duration, format, skill, or classification-confidence fields.

### Classification columns

`subject`, `topic`, `subtopic`, `question_format`, `skill_tag`, `difficulty_score`, `bloom_level`, `estimated_seconds`, `classification_version`, `classification_confidence`, `classification_status`, `topic_mapping_status`, `syllabus_alignment_status`, `secondary_language_code`, `classification_assigned_at`.

For the current drafts:
- `classification_status = 'pending_teacher_review'`
- `classification_version = 'curated_family_rule_v1'`
- `topic_mapping_status = 'rule_based_pending_review'`
- `syllabus_alignment_status = 'unverified'`
- `answer_review_status = 'needs_review'`
- `approved_for_publication = false`
- `authentic_past_question = false` and `exam_year IS NULL`

### Critical distinctions

The classifier uses the generated question's original subject, family and contextual topic. It is **not** independently verified against the full official JAMB syllabus. Many subject banks are narrow despite their 800 records; for example, Government and History consist of repeated paired-fact patterns, and much of Art and Agriculture tests ordinary numeracy in a subject setting. Subtopic breadth is therefore not evidence of syllabus completeness or exam readiness.

Classification confidence describes confidence in the **rule assignment**, **not** confidence that the answer is correct or that the question is appropriate for JAMB. Original answer keys, explanations, historical year, difficulty and syllabus coverage still require academic review. Do not transfer these drafts to a public question-serving table automatically.

### Next work

1. Validate all answers and explanations, with external teaching review and specialist language/religion checks.
2. Audit whether the topics and subtopics really match the full published syllabus. Add missing syllabus areas with **new** questions, rather than re-labelling current templates.
3. Review the question bank for near-duplicates and difficulty balance.
4. Build a teacher-review workflow, then promote approved records to the live bank in controlled batches with verified rights and provenance.
5. Keep true historical past questions in a separate licensed and year-evidenced collection.

Use the sibling `jamb_20k_classification_audit.sql` file for a repeatable, read-only verification.
