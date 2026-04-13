-- ============================================================
-- COEO Project Hub — Schema Migration
-- All tables prefixed with coeo_ to avoid collisions with
-- existing Lotus Ops tables in the same Supabase project.
-- ============================================================

-- Enable UUID generation (may already exist)
create extension if not exists "pgcrypto";

-- ============================================================
-- PROJECTS
-- ============================================================
create table coeo_projects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner         text,
  status        text not null default 'Not Started'
                  check (status in ('Not Started','In Progress','On Hold','Complete','TBD','Unknown')),
  phase_current text,
  phase_next    text,
  key_risk      text,
  progress      integer not null default 0 check (progress >= 0 and progress <= 100),
  notes         text,
  start_date    date,
  end_date      date,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- MILESTONES
-- ============================================================
create table coeo_milestones (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references coeo_projects(id) on delete cascade,
  title         text not null,
  owner         text,
  due_date      date,
  status        text not null default 'Upcoming'
                  check (status in ('Upcoming','Complete','At Risk','Overdue')),
  notes         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- ACTIONS
-- ============================================================
create table coeo_actions (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  owner           text,
  owner_initials  text,
  owner_color     text default '#F4821F',
  status          text not null default 'Open'
                    check (status in ('Open','In Progress','Complete','Blocked')),
  priority        text not null default 'Medium'
                    check (priority in ('High','Medium','Low')),
  due_date        date,
  project_id      uuid references coeo_projects(id) on delete set null,
  notes           text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- SYSTEMS
-- ============================================================
create table coeo_systems (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  subtitle      text,
  category      text not null default 'Internal System'
                  check (category in ('Internal System','Data Source','Infrastructure')),
  purpose       text,
  status        text not null default 'Active'
                  check (status in ('Active','In Progress','Decision Pending',
                                    'To Be Decommissioned','Fragmented','Unknown')),
  owner         text,
  notes         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- VENDORS
-- ============================================================
create table coeo_vendors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  subtitle        text,
  category        text,
  role            text,
  status          text not null default 'Active'
                    check (status in ('Active','Evaluating','On Hold','Former')),
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  contract_ref    text,
  notes           text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- PEOPLE
-- ============================================================
create table coeo_people (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  organization  text not null default 'Coeo Internal',
  role          text,
  initials      text,
  color         text default '#0A2342',
  email         text,
  phone         text,
  focus_areas   text[] default '{}',
  notes         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- JOIN TABLES
-- ============================================================
create table coeo_project_systems (
  project_id    uuid references coeo_projects(id) on delete cascade,
  system_id     uuid references coeo_systems(id) on delete cascade,
  primary key (project_id, system_id)
);

create table coeo_project_vendors (
  project_id    uuid references coeo_projects(id) on delete cascade,
  vendor_id     uuid references coeo_vendors(id) on delete cascade,
  primary key (project_id, vendor_id)
);

create table coeo_project_people (
  project_id    uuid references coeo_projects(id) on delete cascade,
  person_id     uuid references coeo_people(id) on delete cascade,
  primary key (project_id, person_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_coeo_milestones_project on coeo_milestones(project_id);
create index idx_coeo_milestones_due on coeo_milestones(due_date);
create index idx_coeo_actions_project on coeo_actions(project_id);
create index idx_coeo_actions_owner on coeo_actions(owner);
create index idx_coeo_actions_status on coeo_actions(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function coeo_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_coeo_projects_updated before update on coeo_projects
  for each row execute function coeo_set_updated_at();
create trigger trg_coeo_milestones_updated before update on coeo_milestones
  for each row execute function coeo_set_updated_at();
create trigger trg_coeo_actions_updated before update on coeo_actions
  for each row execute function coeo_set_updated_at();
create trigger trg_coeo_systems_updated before update on coeo_systems
  for each row execute function coeo_set_updated_at();
create trigger trg_coeo_vendors_updated before update on coeo_vendors
  for each row execute function coeo_set_updated_at();
create trigger trg_coeo_people_updated before update on coeo_people
  for each row execute function coeo_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (Phase 1 — permissive, no auth)
-- ============================================================
alter table coeo_projects enable row level security;
create policy "coeo_projects_allow_all" on coeo_projects for all using (true) with check (true);

alter table coeo_milestones enable row level security;
create policy "coeo_milestones_allow_all" on coeo_milestones for all using (true) with check (true);

alter table coeo_actions enable row level security;
create policy "coeo_actions_allow_all" on coeo_actions for all using (true) with check (true);

alter table coeo_systems enable row level security;
create policy "coeo_systems_allow_all" on coeo_systems for all using (true) with check (true);

alter table coeo_vendors enable row level security;
create policy "coeo_vendors_allow_all" on coeo_vendors for all using (true) with check (true);

alter table coeo_people enable row level security;
create policy "coeo_people_allow_all" on coeo_people for all using (true) with check (true);

alter table coeo_project_systems enable row level security;
create policy "coeo_project_systems_allow_all" on coeo_project_systems for all using (true) with check (true);

alter table coeo_project_vendors enable row level security;
create policy "coeo_project_vendors_allow_all" on coeo_project_vendors for all using (true) with check (true);

alter table coeo_project_people enable row level security;
create policy "coeo_project_people_allow_all" on coeo_project_people for all using (true) with check (true);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
alter publication supabase_realtime add table coeo_projects;
alter publication supabase_realtime add table coeo_milestones;
alter publication supabase_realtime add table coeo_actions;
alter publication supabase_realtime add table coeo_systems;
alter publication supabase_realtime add table coeo_vendors;
alter publication supabase_realtime add table coeo_people;
