-- ============================================================
-- COEO Project Hub — PMO Tracker Migration
-- Stores rows from the weekly PMO Tracker Excel file.
-- Full-replaced on upload from the PMO project detail page.
-- ============================================================

create table if not exists coeo_pmo_tracker (
  id                    uuid primary key default gen_random_uuid(),
  item_no               integer,
  category              text,
  project_description   text,
  project_objectives    text,
  timing                text,
  rcg_owner             text,
  coeo_support          text,
  third_party_support   text,
  project_start         text,
  project_complete      text,
  project_status        text,
  comments_updates      text,
  uploaded_at           timestamptz not null default now()
);

create index if not exists idx_coeo_pmo_tracker_item_no on coeo_pmo_tracker(item_no);

alter table coeo_pmo_tracker enable row level security;
create policy "coeo_pmo_tracker_allow_all" on coeo_pmo_tracker
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_pmo_tracker;
