-- ============================================================
-- COEO Project Hub — Seed Idempotency
-- Adds unique constraints on natural keys so 002_seed.sql
-- can safely use ON CONFLICT DO NOTHING on re-runs.
-- ============================================================

alter table coeo_projects    add constraint coeo_projects_name_key    unique (name);
alter table coeo_systems     add constraint coeo_systems_name_key     unique (name);
alter table coeo_vendors     add constraint coeo_vendors_name_key     unique (name);
alter table coeo_people      add constraint coeo_people_name_key      unique (name);
alter table coeo_milestones  add constraint coeo_milestones_project_title_key unique (project_id, title);
alter table coeo_actions     add constraint coeo_actions_desc_owner_key unique (description, owner);
