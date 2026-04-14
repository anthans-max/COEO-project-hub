-- ============================================================
-- COEO Project Hub — Project Workspace
-- Adds per-project Meeting Notes and Docs tables.
-- ============================================================

-- Meeting Notes
create table coeo_meeting_notes (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references coeo_projects(id) on delete cascade,
  title         text not null,
  date          date,
  attendees     text,
  notes         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_coeo_meeting_notes_project on coeo_meeting_notes(project_id, date desc);

create trigger trg_coeo_meeting_notes_updated before update on coeo_meeting_notes
  for each row execute function coeo_set_updated_at();

alter table coeo_meeting_notes enable row level security;
create policy "coeo_meeting_notes_allow_all" on coeo_meeting_notes for all using (true) with check (true);

-- Docs
create table coeo_docs (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references coeo_projects(id) on delete cascade,
  title         text not null,
  url           text,
  notes         text,
  date          date,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_coeo_docs_project on coeo_docs(project_id);

create trigger trg_coeo_docs_updated before update on coeo_docs
  for each row execute function coeo_set_updated_at();

alter table coeo_docs enable row level security;
create policy "coeo_docs_allow_all" on coeo_docs for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table coeo_meeting_notes;
alter publication supabase_realtime add table coeo_docs;
