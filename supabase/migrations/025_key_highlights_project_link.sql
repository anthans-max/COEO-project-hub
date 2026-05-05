-- ============================================================
-- COEO Project Hub — Link dashboard highlights to projects
-- Adds a nullable project_id FK so dashboard cards can be
-- "synced" from their underlying project's highlights.
-- ============================================================

alter table coeo_key_highlights
  add column project_id uuid references coeo_projects(id) on delete set null;

create index coeo_key_highlights_project_id_idx
  on coeo_key_highlights(project_id);
