-- ============================================================
-- COEO Project Hub — Action Activity Log
-- Append-only, read-once-submitted log of user comments
-- attached to a specific action item. Author name/initials/color
-- are snapshotted at write time so historical entries remain
-- stable if the person record is later edited.
-- ============================================================

create table if not exists coeo_action_log (
  id                 uuid primary key default gen_random_uuid(),
  action_id          uuid not null references coeo_actions(id) on delete cascade,
  body               text not null,
  author_person_id   uuid references coeo_people(id) on delete set null,
  author_name        text,
  author_initials    text,
  author_color       text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_coeo_action_log_action_created
  on coeo_action_log(action_id, created_at desc);

alter table coeo_action_log enable row level security;
create policy "coeo_action_log_allow_all"
  on coeo_action_log for all using (true) with check (true);

alter publication supabase_realtime add table coeo_action_log;
