-- ============================================================
-- COEO Project Hub — Meeting notes summary field
-- Short, exec-grade summary rendered on the weekly exec report.
-- The full free-form `notes` column is unchanged.
-- ============================================================

alter table coeo_meeting_notes add column summary text;
