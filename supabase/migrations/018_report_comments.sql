-- ============================================================
-- COEO Project Hub — Exec Report support
-- New table for free-form weekly report commentary, plus columns
-- on coeo_projects (vendor) and coeo_key_highlights (date) needed
-- by the exec report page at /reporting/exec-report.
-- ============================================================

create table coeo_report_comments (
  id                uuid primary key default gen_random_uuid(),
  topic             text not null,
  description       text not null,
  project_tag       text,
  tag_colour        text check (tag_colour in ('blue','amber','green','orange')) default 'blue',
  owner             text,
  report_week_start date not null,
  created_at        timestamptz not null default now()
);

alter table coeo_report_comments enable row level security;
create policy "coeo_report_comments_allow_all" on coeo_report_comments
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_report_comments;

-- Vendor label shown under each Gantt row in the exec report.
alter table coeo_projects add column vendor text;

-- Date the highlight describes (distinct from updated_at).
alter table coeo_key_highlights add column date date;
