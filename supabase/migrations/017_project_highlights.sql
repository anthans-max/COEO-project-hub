-- ============================================================
-- COEO Project Hub — Project Highlights
-- Per-project narrative bullets shown on the project detail page.
-- One row per project (enforced by the unique constraint).
-- ============================================================

create table coeo_project_highlights (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references coeo_projects(id) on delete cascade,
  bullets     text[] not null default '{}',
  updated_at  timestamptz not null default now(),
  unique (project_id)
);

create trigger trg_coeo_project_highlights_updated before update on coeo_project_highlights
  for each row execute function coeo_set_updated_at();

alter table coeo_project_highlights enable row level security;
create policy "coeo_project_highlights_allow_all" on coeo_project_highlights
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_project_highlights;
