-- ============================================================
-- COEO Project Hub — Weekly exec-report narrative
-- One row per ISO week. focused_theme_codes is a Postgres text
-- array (e.g. ARRAY['T-02','T-04']); commentary is a single
-- free-text block rendered below the focused-themes grid.
-- ============================================================

create table coeo_report_narrative (
  id                  uuid primary key default gen_random_uuid(),
  report_week_start   date not null unique,
  focused_theme_codes text[] not null default '{}',
  commentary          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table coeo_report_narrative enable row level security;
create policy "coeo_report_narrative_allow_all" on coeo_report_narrative
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_report_narrative;
