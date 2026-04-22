-- ============================================================
-- COEO Project Hub — Architecture layers
-- Makes the Ecosystem Architecture page data-driven. Decision
-- badges previously hardcoded on the Middleware layer are now
-- linked to coeo_program_decisions via decision_codes[].
-- ============================================================

create table coeo_architecture_layers (
  id              uuid primary key default gen_random_uuid(),
  layer_id        text not null unique,
  label           text not null,
  color           text not null,
  bg_color        text not null,
  modules         text[] not null default '{}',
  note            text,
  decision_codes  text[] not null default '{}',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_coeo_architecture_layers_updated before update on coeo_architecture_layers
  for each row execute function coeo_set_updated_at();

alter table coeo_architecture_layers enable row level security;
create policy "coeo_architecture_layers_allow_all" on coeo_architecture_layers
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_architecture_layers;

-- ============================================================
-- SEED — 4 layers, verbatim from the former LAYERS constant
-- in architecture-view.tsx, with one content correction:
-- Middleware modules changed from
--   ['API Gateway','n8n Orchestration','Integration Bus']
-- to
--   ['n8n Orchestration','App Server']
-- to reflect the data warehouse diagram. The old hardcoded
-- "OI-002 / OI-005 — Decision Required" warning is replaced by
-- decision_codes linking live to coeo_program_decisions.
-- ============================================================
insert into coeo_architecture_layers (layer_id, label, color, bg_color, modules, note, decision_codes, sort_order) values
  ('portal', 'Customer Portal', '#1e4d8c', '#eef3fc',
   array['Dashboard','Billing','Support','Services','Orders','Account Mgmt','Monitoring','Auth/Authz'],
   'Customer-facing self-service layer. Built by Technovate / Nextian.',
   array[]::text[],
   1),
  ('middleware', 'Middleware / Orchestration / API', '#c87d2f', '#fdf4e8',
   array['n8n Orchestration','App Server'],
   'Architecture approach TBD — key open decision for Enterprise Middleware workstream.',
   array['OI-002','OI-005'],
   2),
  ('coeo', 'Coeo Systems', '#1a6b5c', '#f0faf7',
   array['Rev.io (Billing)','Data Warehouse (StarRocks)','CRM (Salesforce)','NMS / SolarWinds / Prometheus','EMS / PSX','IdP (Entra ID)'],
   'Internal systems of record. Data Warehouse acts as integration hub via AWS/n8n.',
   array[]::text[],
   3),
  ('client', 'Client Systems', '#5c1a6b', '#faf0fc',
   array['Customer Router','Customer IdP'],
   'Customer-side infrastructure — relevant for SSO federation and monitoring.',
   array[]::text[],
   4);
