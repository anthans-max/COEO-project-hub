-- ============================================================
-- COEO Project Hub — Project Phases (for Gantt chart)
-- ============================================================

create table if not exists coeo_project_phases (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references coeo_projects(id) on delete cascade,
  name          text not null,
  description   text,
  status        text not null default 'upcoming'
                  check (status in ('completed', 'in_progress', 'upcoming', 'at_risk')),
  start_date    date,
  end_date      date,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_coeo_project_phases_project
  on coeo_project_phases(project_id, sort_order);

create trigger trg_coeo_project_phases_updated before update on coeo_project_phases
  for each row execute function coeo_set_updated_at();

alter table coeo_project_phases enable row level security;
create policy "coeo_project_phases_allow_all" on coeo_project_phases for all using (true) with check (true);

alter publication supabase_realtime add table coeo_project_phases;
