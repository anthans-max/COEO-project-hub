-- ============================================================
-- COEO Project Hub — Budget Tracking
-- Adds project-level budget cap and a per-project ledger of
-- monthly actual / forecast entries.
-- ============================================================

alter table coeo_projects add column if not exists budget_amount numeric(12, 2);

create table coeo_budget_entries (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references coeo_projects(id) on delete cascade,
  entry_type   text not null check (entry_type in ('actual', 'forecast')),
  period_year  int  not null,
  period_month int  not null check (period_month between 1 and 12),
  amount       numeric(12, 2) not null default 0,
  notes        text,
  created_at   timestamptz not null default now(),
  unique (project_id, entry_type, period_year, period_month)
);
create index idx_coeo_budget_entries_project on coeo_budget_entries(project_id);

alter table coeo_budget_entries enable row level security;
create policy "coeo_budget_entries_allow_all"
  on coeo_budget_entries for all using (true) with check (true);

alter publication supabase_realtime add table coeo_budget_entries;
