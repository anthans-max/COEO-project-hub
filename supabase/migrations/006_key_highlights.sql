-- ============================================================
-- COEO Project Hub — Key Highlights
-- Dashboard "Key highlights" cards, editable via UI.
-- ============================================================

create table coeo_key_highlights (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  headline    text not null,
  body        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_coeo_key_highlights_updated before update on coeo_key_highlights
  for each row execute function coeo_set_updated_at();

alter table coeo_key_highlights enable row level security;
create policy "coeo_key_highlights_allow_all" on coeo_key_highlights
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_key_highlights;

-- Seed the 3 cards with the current hardcoded copy.
insert into coeo_key_highlights (category, headline, body, sort_order) values
  ('Data Warehouse',
   'Data Warehouse Phase 2 in progress',
   'Foundational KPIs and reports on track. Initial build and StarRocks database operational.',
   0),
  ('Customer Portal',
   'Customer Portal requirements gathering and POC underway',
   'POC demos planned by end of month by Technovate and Nextian.',
   1),
  ('Salesforce Discovery',
   'Salesforce discovery discussions being faciliated by SETGO',
   'Discussions being held with COEO project and operational stakeholders to gather feedback',
   2);
