-- ============================================================
-- COEO Project Hub — Gantt visibility flag for the exec report
-- Defaults to true so the report keeps rendering until Anthan
-- curates the list in the Supabase Table Editor.
-- ============================================================

alter table coeo_projects
  add column show_on_report boolean not null default true;
