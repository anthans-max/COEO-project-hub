-- ============================================================
-- COEO Project Hub — Add free-text "other comments" field
-- to the weekly exec-report narrative row.
-- ============================================================

alter table coeo_report_narrative add column comments_text text;
