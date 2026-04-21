-- ============================================================
-- COEO Project Hub — Program settings
-- Simple key/value table for single-row editable program-level copy
-- (e.g. the Strategy page vision block).
-- ============================================================

create table coeo_program_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_coeo_program_settings_updated before update on coeo_program_settings
  for each row execute function coeo_set_updated_at();

alter table coeo_program_settings enable row level security;
create policy "coeo_program_settings_allow_all" on coeo_program_settings
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_program_settings;

-- Seed the current hardcoded Strategy vision copy.
insert into coeo_program_settings (key, value) values
  ('program_vision',
   'To build a unified, API-first technology platform that gives Coeo customers full visibility and control over their services, while eliminating the fragmented internal tooling that increases handling time and erodes data quality.');
