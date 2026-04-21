-- ============================================================
-- COEO Project Hub — Program section
-- Strategic themes, open decisions, and budget placeholder.
-- Seeded verbatim from design-reference/coeo-program-prototype.jsx.
-- ============================================================

-- ============================================================
-- PROGRAM THEMES
-- ============================================================
create table coeo_program_themes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  title       text not null,
  icon        text,
  color       text,
  bg_color    text,
  description text,
  workstreams text[] not null default '{}',
  outcomes    text[] not null default '{}',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_coeo_program_themes_updated before update on coeo_program_themes
  for each row execute function coeo_set_updated_at();

alter table coeo_program_themes enable row level security;
create policy "coeo_program_themes_allow_all" on coeo_program_themes
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_program_themes;

-- ============================================================
-- PROGRAM DECISIONS
-- ============================================================
create table coeo_program_decisions (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  title           text not null,
  detail          text,
  impact          text,
  owner           text,
  target_quarter  text,
  theme_codes     text[] not null default '{}',
  status          text not null default 'open'
                    check (status in ('open','in_progress','resolved')),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_coeo_program_decisions_updated before update on coeo_program_decisions
  for each row execute function coeo_set_updated_at();

alter table coeo_program_decisions enable row level security;
create policy "coeo_program_decisions_allow_all" on coeo_program_decisions
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_program_decisions;

-- ============================================================
-- PROGRAM BUDGET
-- Single table, discriminated by `category` ∈ ('phase','workstream').
-- Phase rows use `notes` as a newline-separated list of line items.
-- Workstream rows use `notes` as a free-text note.
-- ============================================================
create table coeo_program_budget (
  id              uuid primary key default gen_random_uuid(),
  category        text not null check (category in ('phase','workstream')),
  name            text not null,
  vendor          text,
  phase           text,
  target_dates    text,
  estimated_cost  text,
  notes           text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_coeo_program_budget_updated before update on coeo_program_budget
  for each row execute function coeo_set_updated_at();

alter table coeo_program_budget enable row level security;
create policy "coeo_program_budget_allow_all" on coeo_program_budget
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_program_budget;

-- ============================================================
-- SEED — THEMES (7 rows, verbatim from the prototype)
-- ============================================================
insert into coeo_program_themes (code, title, icon, color, bg_color, description, workstreams, outcomes, sort_order) values
  ('T-01', 'Data Quality & Integrity', '⬡', '#1a6b5c', '#f0faf7',
   'Establishing Salesforce record completeness, Rev.io service linkage, and data warehouse reliability as the foundational layer of the program. Nothing downstream is credible without clean, consistent data.',
   array['Data Warehouse','Salesforce Discovery','Salesforce Maintenance'],
   array[
     'Salesforce field completeness baseline established and tracked',
     'Circuit-to-asset relationships accurately represented in data model',
     'Rev.io and Salesforce records linked via unified account identifier',
     'Data warehouse ingestion validated across all source systems'
   ],
   1),
  ('T-02', 'System Integration & Architecture', '◈', '#1e4d8c', '#f0f4fc',
   'Defining and building the middleware and API orchestration layer that connects all backend systems. The current logical diagram shows an open question at the middleware layer — resolving this is a prerequisite for scalable integration.',
   array['Enterprise Middleware','Data Warehouse','Customer Portal'],
   array[
     'Middleware/orchestration approach agreed and documented',
     'API-first integration standards defined and adopted across all workstreams',
     'n8n orchestration layer stabilised and documented',
     'All source system integrations use versioned, documented APIs'
   ],
   2),
  ('T-03', 'Operational State Visibility', '◎', '#7c4d1e', '#fdf6f0',
   'Giving internal staff and customers real-time visibility into service health, circuit status, and alert state. Currently siloed across SolarWinds and multiple vendor portals — consolidation via Prometheus is in progress.',
   array['Customer Portal','Data Warehouse','Operational State Consolidation'],
   array[
     'Single source of truth for operational state established (Prometheus/NMS)',
     'Real-time service status surfaced in customer portal',
     'Proactive alerting linked to customer accounts',
     'SolarWinds dependency reduced or eliminated for customer-facing access'
   ],
   3),
  ('T-04', 'Customer Visibility & Self-Service', '▣', '#5c1a6b', '#faf0fc',
   'Delivering a unified customer portal that replaces fragmented phone, email, and disconnected portal touchpoints with a single self-service platform covering billing, services, support, and monitoring.',
   array['Customer Portal'],
   array[
     'Customers can view, download, and query invoices without contacting support',
     'Full service inventory visible with circuit IDs, status, and contract terms',
     'Support cases created, tracked, and communicated via portal',
     'Contract renewal visibility with proactive notifications'
   ],
   4),
  ('T-05', 'Identity, Access & Security', '◉', '#1a3d6b', '#f0f4fa',
   'Establishing SSO, MFA, and role-based access control across the customer portal and internal systems. Coeo''s Microsoft 365 environment makes Entra ID the likely identity provider — confirmation is needed to unblock auth implementation.',
   array['Customer Portal','Salesforce Discovery'],
   array[
     'SSO identity provider confirmed and configured',
     'Role-based access model implemented across all portal personas',
     'MFA enforced per role, manageable without Coeo involvement',
     'Customer user provisioning and deprovisioning fully self-service'
   ],
   5),
  ('T-06', 'Workflow Efficiency', '▦', '#3d6b1a', '#f4faf0',
   'Streamlining internal staff workflows for case management, quoting, and service activation. Where Salesforce redesign and the customer portal converge — reducing handle time and eliminating dependency on tribal knowledge.',
   array['Salesforce Discovery','Customer Portal','Enterprise Middleware'],
   array[
     'Case creation and tracking unified in a single system',
     'Quoting and order tracking accessible to customers without account manager involvement',
     'Internal staff have a single screen showing service, billing, and case context per customer',
     'Handoff between teams standardised and tracked'
   ],
   6),
  ('T-07', 'Reporting & Analytics', '◧', '#6b1a1a', '#faf0f0',
   'Delivering the data warehouse''s output layer — executive dashboards, scheduled report exports, and the weekly AI-generated network health digest. The value realisation theme that makes the program''s investment visible to leadership.',
   array['Data Warehouse','Customer Portal'],
   array[
     'Executive dashboards available via data warehouse (StarRocks/coeosolutions.com)',
     'Scheduled cross-module report exports available to customers',
     'Weekly AI-generated network health digest delivered per customer account',
     'Program-level reporting available in project hub for PMO governance'
   ],
   7);

-- ============================================================
-- SEED — DECISIONS (9 rows, verbatim from the prototype)
-- ============================================================
insert into coeo_program_decisions (code, title, detail, impact, owner, target_quarter, theme_codes, status, sort_order) values
  ('OI-001', 'Case Management System of Record',
   'Will Salesforce remain the case management system, or will it be replaced as a result of the Salesforce Discovery program?',
   'Integration architecture for Support module cannot be finalised until resolved.',
   'Coeo IT / Salesforce Discovery', 'Q2 2026',
   array['T-01','T-03','T-06'], 'open', 1),
  ('OI-002', 'Phase 1 Scope Confirmation',
   'Is full User & Role management (SSO, MFA, invite workflows) required for Phase 1 launch, or is a simplified access model acceptable as an interim?',
   'Phase 1 delivery timeline and complexity.',
   'Coeo IT / Business Stakeholders', 'Q2 2026',
   array['T-04','T-05'], 'open', 2),
  ('OI-003', 'Identity Provider for SSO',
   'Which identity provider will be used for portal SSO? Microsoft Entra ID is the likely answer given Coeo''s M365 environment, but this needs confirmation.',
   'Auth implementation cannot start until confirmed.',
   'Coeo IT', 'Q2 2026',
   array['T-05'], 'open', 3),
  ('OI-004', 'Rev.io API Capabilities',
   'What APIs does Rev.io expose for invoice, usage, and payment data? Are there constraints affecting the Billing module scope?',
   'Billing module scope and timeline. Some capabilities may be constrained by what Rev.io''s API supports.',
   'Coeo Finance / Rev.io', 'Q2 2026',
   array['T-01','T-07'], 'open', 4),
  ('OI-005', 'Network Monitoring Platform',
   'What is the monitoring platform that will be the source of truth for performance data? SolarWinds → Prometheus migration in progress.',
   'Monitoring module cannot be scoped or scheduled until confirmed.',
   'Coeo IT / NOC', 'Q2 2026',
   array['T-02','T-03'], 'open', 5),
  ('OI-006', 'Partner / MSP Access Model',
   'Are there Partner or MSP customers who need multi-account aggregation views in Phase 1, or is this a Phase 2 requirement?',
   'Multi-account architecture is more complex. If Phase 1 requires it, scope and timeline increase materially.',
   'Coeo Sales / Account Management', 'Q2 2026',
   array['T-04'], 'open', 6),
  ('OI-007', 'Notification Channels for Phase 1',
   'Email and SMS confirmed for Phase 1. Are Microsoft Teams notifications required in Phase 1, or can Teams/Slack be deferred to Phase 2?',
   'Teams webhook integration adds scope. Decision affects Phase 1 delivery.',
   'Coeo IT / Business Stakeholders', 'Q2 2026',
   array['T-04'], 'open', 7),
  ('OI-008', 'Data Retention & Audit Requirements',
   'What is the required retention period for case history, billing data, performance data, and access logs in the portal?',
   'Affects storage architecture, compliance posture, and hosting cost estimates.',
   'Coeo IT / Legal / Compliance', 'Q2 2026',
   array['T-07'], 'open', 8),
  ('OI-009', 'Vendor Scope Allocation',
   'How is delivery scope divided between Technovate, Nextian, and other vendors? The BRD covers the full program — allocation of modules to vendors needs to be agreed.',
   'Without clarity, there is risk of scope gaps or duplication between vendors.',
   'Coeo IT Project Team', 'Q2 2026',
   array['T-02','T-06'], 'open', 9);

-- ============================================================
-- SEED — BUDGET (3 phase rows + 5 workstream rows, verbatim)
-- Phase rows: `notes` holds newline-separated line items.
-- ============================================================
insert into coeo_program_budget (category, name, vendor, phase, target_dates, estimated_cost, notes, sort_order) values
  ('phase', 'Discovery & POC', null, null, 'Q1–Q2 2026', 'TBC',
   E'BRD & requirements\nVendor POC demonstrations\nArchitecture assessment\nSalesforce discovery', 1),
  ('phase', 'Phase 1 Development', null, null, 'Q2–Q3 2026', 'TBC',
   E'Portal build (Technovate / Nextian)\nData warehouse extension\nIntegration layer build\nUAT & launch', 2),
  ('phase', 'Phase 2 & Ongoing', null, null, 'Q4 2026+', 'TBC',
   E'Phase 2 scope TBD\nSalesforce implementation\nEnterprise middleware\nOngoing maintenance', 3),
  ('workstream', 'Customer Portal', 'Technovate / Nextian', 'Phase 1', null, 'TBC',
   'Pending vendor scope allocation (OI-009)', 1),
  ('workstream', 'Data Warehouse', 'Internal / AWS', 'Ongoing', null, 'TBC',
   'AWS infrastructure costs to be confirmed', 2),
  ('workstream', 'Salesforce Discovery', 'SETGO', 'Q1–Q2 2026', null, 'TBC',
   'Discovery engagement in progress', 3),
  ('workstream', 'Salesforce Maintenance', 'Internal', 'Ongoing', null, 'TBC',
   'BAU — existing budget', 4),
  ('workstream', 'Enterprise Middleware', 'TBD', 'Q2 2026+', null, 'TBC',
   'Pending architecture decision', 5);
