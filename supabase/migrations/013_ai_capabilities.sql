-- ============================================================
-- COEO Project Hub — AI Capability Map
-- Makes the AI Capability Map page data-driven. Rows are seeded
-- from the former static list in src/lib/data/ai-capabilities.ts.
-- theme_code is a soft reference to coeo_program_themes.code
-- (matches coeo_program_decisions.theme_codes convention — no FK).
-- architecture_layers[] stores coeo_architecture_layers.layer_id
-- slugs (e.g. 'portal', 'middleware') so the page can render the
-- current label + colour live.
-- ============================================================

create table coeo_ai_capabilities (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text,
  theme_code            text not null,
  maturity              text not null default 'exploratory'
                          check (maturity in ('exploratory','planned','pilot','live')),
  dependencies          text[] not null default '{}',
  architecture_layers   text[] not null default '{}',
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_coeo_ai_capabilities_updated before update on coeo_ai_capabilities
  for each row execute function coeo_set_updated_at();

alter table coeo_ai_capabilities enable row level security;
create policy "coeo_ai_capabilities_allow_all" on coeo_ai_capabilities
  for all using (true) with check (true);

alter publication supabase_realtime add table coeo_ai_capabilities;

-- ============================================================
-- SEED — 13 capabilities, verbatim from the former static list.
-- All maturities flattened to 'exploratory' — AI capability
-- review with Jack has not yet taken place, so nothing is
-- further along than exploratory at this stage.
-- ============================================================
insert into coeo_ai_capabilities
  (theme_code, title, description, maturity, dependencies, architecture_layers, sort_order) values
  ('T-01', 'Field Completeness Copilot',
   'Suggests likely values for missing or inconsistent Salesforce fields by learning from historically complete records, surfacing a prioritised queue for data stewards instead of bulk cleanup projects.',
   'exploratory', array[]::text[], array['coeo'], 1),
  ('T-01', 'Circuit-to-Asset Link Suggester',
   'Reconciles Rev.io service records with Salesforce assets by proposing likely matches from billing identifiers, circuit IDs, and account metadata — reducing the manual linkage effort behind the unified account identifier.',
   'exploratory', array[]::text[], array['coeo'], 2),
  ('T-02', 'Integration Anomaly Detection',
   'Monitors n8n flow outputs for schema drift, unexpected nulls, and payload shape changes, flagging them before they corrupt downstream systems. Acts as a safety net for the still-maturing middleware layer.',
   'exploratory', array['T-01'], array['middleware'], 3),
  ('T-02', 'API Contract Drift Review',
   'Compares documented API contracts against live responses across source systems, auto-generating a delta report so integration owners can catch vendor-side changes before they break orchestration.',
   'exploratory', array[]::text[], array['middleware','coeo'], 4),
  ('T-03', 'Alert Triage Summariser',
   'Collapses alert storms from Prometheus/NMS into a plain-English root-cause narrative scoped to a customer account, so NOC staff open a triage view with context rather than a thousand raw events.',
   'exploratory', array['T-01','T-02'], array['coeo','portal'], 5),
  ('T-03', 'Predictive Service Health',
   'Uses historical NMS signals to flag circuits trending toward degradation before customers notice, enabling proactive outreach from the same operational state layer that powers the customer portal.',
   'exploratory', array['T-01'], array['coeo'], 6),
  ('T-04', 'Invoice Q&A Assistant',
   'Portal-embedded assistant that answers natural-language invoice questions ("why did this line go up?") using Rev.io data, cutting the volume of billing cases that currently reach support.',
   'exploratory', array['T-01'], array['portal','coeo'], 7),
  ('T-04', 'Service Inventory Search',
   'Semantic search across a customer''s services, circuits, and contract terms so portal users can ask for "all MPLS circuits renewing in the next 90 days" without filters or support involvement.',
   'exploratory', array[]::text[], array['portal'], 8),
  ('T-05', 'Access Review Summariser',
   'Surfaces unusual permission grants and stale role assignments ahead of quarterly access reviews, giving reviewers a ranked shortlist instead of a full RBAC export to work through.',
   'exploratory', array[]::text[], array['portal','coeo'], 9),
  ('T-06', 'Case Draft Generator',
   'Pre-drafts case summaries, categorisation, and suggested next actions from inbound emails and call transcripts, so agents validate a draft instead of typing from scratch.',
   'exploratory', array['T-01'], array['coeo','portal'], 10),
  ('T-06', 'Quote Assembly Assistant',
   'Assembles draft quotes from service inventory and historical pricing patterns, reducing the tribal-knowledge dependency that currently sits with a handful of account managers.',
   'exploratory', array['T-01'], array['coeo'], 11),
  ('T-07', 'Weekly Network Health Digest',
   'Per-account AI-written digest covering circuit availability, incident summary, and trending risks — delivered weekly and already named as a T-07 outcome in the program charter.',
   'exploratory', array['T-01','T-03'], array['coeo','portal'], 12),
  ('T-07', 'Executive Insight Generator',
   'Generates natural-language commentary over executive dashboard trends so leadership gets "what changed and why" alongside the numbers, without an analyst manually writing the narrative each cycle.',
   'exploratory', array['T-01'], array['coeo'], 13);
