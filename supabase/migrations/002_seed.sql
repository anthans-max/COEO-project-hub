-- ============================================================
-- COEO Project Hub — Seed Data
-- From the April 13, 2026 kickoff meeting with Jack Minster
-- ============================================================

-- ============================================================
-- PEOPLE
-- ============================================================
INSERT INTO coeo_people (name, organization, role, initials, color, email, focus_areas, sort_order) VALUES
  ('Jack Minster',   'Coeo Internal', 'IT Lead',             'JM', '#0A2342', null, ARRAY['Data Warehouse','Customer Portal','BSS','Acquisitions'], 1),
  ('Anthan Sunder',  'Coeo Internal', 'IT Consultant',       'AS', '#F4821F', null, ARRAY['PM & Governance','Vendor Management','Project Tracking'], 2),
  ('Mamata Huded',   'Coeo Internal', 'Salesforce Admin',    'MH', '#059669', null, ARRAY['Salesforce','CRM'], 3),
  ('Sean',           'Coeo Internal', 'Network / Infra',     'S',  '#3B82F6', null, ARRAY['Network','Infrastructure','Provisioning'], 4),
  ('SETGO',          'Vendor',        'Salesforce Partner',   'SE', '#8B5CF6', null, ARRAY['Salesforce'], 5),
  ('Technovate',     'Vendor',        'Portal Development',  'TV', '#EC4899', null, ARRAY['Customer Portal'], 6);

-- ============================================================
-- PROJECTS
-- ============================================================
INSERT INTO coeo_projects (name, owner, status, phase_current, phase_next, key_risk, progress, notes, start_date, end_date, sort_order) VALUES
  ('Data Warehouse',        'Jack Minster',  'In Progress',  'Q2: Secondary KPIs',           'Q3: Phase 2 expansion',          'Data source mapping complexity',                    33, 'Core reporting infrastructure. Primary KPIs delivered Q1; now building secondary metrics.', '2026-01-15', '2026-09-30', 1),
  ('Customer Portal',       'Jack Minster',  'In Progress',  'Q2: Prototype / POC',           'Q3: Build & launch',             'Vendor selection pending; scope creep risk',         25, 'Self-service portal for customers. Evaluating build vs. buy options with Technovate.',      '2026-03-01', '2026-12-31', 2),
  ('Salesforce Discovery',  'Mamata Huded',  'In Progress',  'Q2: Discovery & design',        'Q3: Rebuild or refactor decision','Refactor vs rebuild decision not yet made',          20, 'Full audit of current Salesforce org. Working with SETGO to assess state and options.',     '2026-04-01', '2026-09-30', 3),
  ('Salesforce Maintenance', 'Mamata Huded', 'In Progress',  'Ongoing: Bug fixes & requests', 'Continued support',              'Reactive workload may conflict with discovery',      40, 'Day-to-day Salesforce support, bug fixes, and user requests while discovery is underway.', '2026-01-01', '2026-12-31', 4),
  ('Enterprise Middleware',  'Jack Minster',  'TBD',         'Assessment phase',              'Architecture decision',          'No clear owner or direction yet',                     5,  'Integration layer between core systems. Needs architecture assessment.',                   '2026-04-01', '2026-12-31', 5),
  ('Acquisitions',          'Jack Minster',  'Not Started',  'Pending: IT integration planning', 'As acquisitions occur',       'Timing and scope unknown; depends on deal flow',     0,  'IT integration playbook for future acquisitions. No active deals yet.',                    '2026-06-01', '2026-12-31', 6),
  ('TransUnion (Neustar)',  'Jack Minster',  'Not Started',  'Q3: BSS Integration planning',  'TBD',                            'Integration scope and timing TBD',                   0,  'BSS integration planning for the TransUnion (Neustar) data feed.',                         '2026-07-01', '2026-12-31', 7),
  ('KYC',                   'Jack Minster',  'In Progress',  'Ongoing: Process support',      'Automation opportunities',       'Manual processes; compliance dependencies',           15, 'Supporting customer transitions and KYC processes. Exploring automation.',                 '2026-01-01', '2026-12-31', 8),
  ('Provisioning Portal',   'Sean',          'In Progress',  'Q2: Enhancements',              'Q3: Expanded automation',        'Dependency on network team bandwidth',                30, 'Internal provisioning tool for service activation. Ongoing enhancements.',                 '2026-02-01', '2026-09-30', 9);

-- ============================================================
-- MILESTONES (linked to projects by name lookup)
-- ============================================================
WITH proj AS (
  SELECT id, name FROM coeo_projects
)
INSERT INTO coeo_milestones (project_id, title, owner, due_date, status, notes, sort_order) VALUES
  ((SELECT id FROM proj WHERE name = 'Data Warehouse'),       'Primary KPIs live',                     'Jack Minster',  '2026-03-31', 'Complete',  'Delivered end of Q1.',                            1),
  ((SELECT id FROM proj WHERE name = 'Data Warehouse'),       'Secondary KPIs defined',                'Jack Minster',  '2026-06-30', 'Upcoming',  'Define and validate secondary metric set.',       2),
  ((SELECT id FROM proj WHERE name = 'Customer Portal'),      'Vendor shortlist finalized',             'Jack Minster',  '2026-05-15', 'Upcoming',  'Narrow to 2-3 vendors for portal build.',         3),
  ((SELECT id FROM proj WHERE name = 'Customer Portal'),      'POC complete',                           'Jack Minster',  '2026-07-31', 'Upcoming',  'Working prototype from selected vendor.',         4),
  ((SELECT id FROM proj WHERE name = 'Salesforce Discovery'), 'Discovery complete',                     'Mamata Huded',  '2026-06-30', 'Upcoming',  'Full current-state audit finished.',              5),
  ((SELECT id FROM proj WHERE name = 'Salesforce Discovery'), 'Rebuild vs. refactor decision',          'Mamata Huded',  '2026-05-31', 'At Risk',   'Key decision needed before design can proceed.', 6),
  ((SELECT id FROM proj WHERE name = 'Enterprise Middleware'), 'Architecture assessment complete',       'Jack Minster',  '2026-06-30', 'Upcoming',  'Evaluate middleware options and integration patterns.', 7),
  ((SELECT id FROM proj WHERE name = 'Provisioning Portal'),  'Q2 enhancements deployed',               'Sean',          '2026-06-30', 'Upcoming',  'Current sprint of provisioning improvements.',   8);

-- ============================================================
-- ACTIONS
-- ============================================================
WITH proj AS (
  SELECT id, name FROM coeo_projects
)
INSERT INTO coeo_actions (description, owner, owner_initials, owner_color, status, priority, due_date, project_id, notes, sort_order) VALUES
  ('Review meeting transcript and synthesize notes',           'Anthan Sunder', 'AS', '#F4821F', 'Open', 'High',   '2026-04-18', null,                                                            'From April 13 kickoff meeting.',        1),
  ('Get up to speed on vendors and active projects',           'Anthan Sunder', 'AS', '#F4821F', 'Open', 'High',   '2026-04-25', null,                                                            'Review all vendor contracts and status.', 2),
  ('Engage Technovate — requirements review',                  'Anthan Sunder', 'AS', '#F4821F', 'Open', 'High',   '2026-04-25', (SELECT id FROM proj WHERE name = 'Customer Portal'),             'Portal vendor evaluation.',             3),
  ('Provide guidance on PM structure and governance',          'Anthan Sunder', 'AS', '#F4821F', 'Open', 'Medium', '2026-05-01', null,                                                            'Framework for project tracking.',       4),
  ('Confirm portal vendor evaluation criteria',                'Jack Minster',  'JM', '#0A2342', 'Open', 'High',   '2026-04-25', (SELECT id FROM proj WHERE name = 'Customer Portal'),             'Align on build vs buy criteria.',       5),
  ('Clarify BSS migration timeline for H2',                    'Jack Minster',  'JM', '#0A2342', 'Open', 'Medium', '2026-05-15', null,                                                            'What platform and when?',               6),
  ('Provide CRM standardization direction to team',            'Jack Minster',  'JM', '#0A2342', 'Open', 'Medium', '2026-05-01', null,                                                            'Salesforce vs Zoho exec decision.',     7),
  ('Complete Salesforce current-state audit',                   'Mamata Huded',  'MH', '#059669', 'Open', 'High',   '2026-05-15', (SELECT id FROM proj WHERE name = 'Salesforce Discovery'),       'Working with SETGO on assessment.',     8),
  ('Coordinate with SETGO on discovery timeline',              'Mamata Huded',  'MH', '#059669', 'Open', 'Medium', '2026-04-30', (SELECT id FROM proj WHERE name = 'Salesforce Discovery'),       'Align on deliverables and schedule.',   9);

-- ============================================================
-- SYSTEMS
-- ============================================================
INSERT INTO coeo_systems (name, subtitle, category, purpose, status, owner, notes, sort_order) VALUES
  ('Salesforce',           'CRM & sales platform',           'Internal System', 'Customer relationship management and sales pipeline',            'Fragmented', 'Mamata Huded', 'Multiple orgs, inconsistent configuration. Discovery underway.',                   1),
  ('Customer Portal',      'Self-service customer portal',   'Internal System', 'Customer-facing portal for account management and support',     'In Progress', 'Jack Minster', 'Current portal is outdated. New build being evaluated.',                            2),
  ('BSS / Billing',        'Billing support system',         'Internal System', 'Billing, invoicing, and service provisioning',                  'Active',      'Jack Minster', 'Current BSS operational. Migration being considered for H2.',                       3),
  ('SharePoint',           'Document management',            'Internal System', 'Internal document storage and collaboration',                   'Active',      null,           'Used across teams. No major changes planned.',                                      4),
  ('Provisioning Portal',  'Service activation tool',        'Internal System', 'Internal tool for provisioning and activating services',        'Active',      'Sean',         'Ongoing enhancements in Q2.',                                                       5),
  ('Data Warehouse',       'Reporting & analytics',          'Data Source',     'Centralized data warehouse for KPIs and reporting',             'In Progress', 'Jack Minster', 'Primary KPIs live. Secondary metrics in development.',                              6),
  ('Carrier APIs',         'Carrier integration layer',      'Data Source',     'API integrations with telecom carriers',                        'Active',      null,           'Multiple carrier integrations. Maintenance and monitoring.',                         7),
  ('Network Monitoring',   'Infrastructure monitoring',      'Infrastructure',  'Network health monitoring and alerting',                        'Active',      'Sean',         'Evaluating tool upgrades.',                                                         8),
  ('Jira',                 'Project task tracker',           'Internal System', 'Project task tracker',                                          'Decision Pending', null,      'Team is consolidating project tracking away from Jira into a single tool.',         9);

-- ============================================================
-- VENDORS
-- ============================================================
INSERT INTO coeo_vendors (name, subtitle, category, role, status, contact_name, contact_email, notes, sort_order) VALUES
  ('SETGO',       'Salesforce consulting',  'Salesforce Partner', 'Salesforce discovery and implementation partner', 'Active',     null, null, 'Engaged for Salesforce discovery and potential rebuild.',       1),
  ('Technovate',  'Portal development',     'Portal Vendor',      'Customer portal build evaluation',                'Evaluating', null, null, 'Being evaluated for customer portal prototype/POC.',           2),
  ('Microsoft',   'Platform & productivity','Platform Provider',  'Office 365, Azure AD, SharePoint',                'Active',     null, null, 'Core platform provider. SSO via Entra ID planned for Phase 2.', 3),
  ('Current BSS Vendor', 'Billing platform','BSS Provider',       'Current billing support system provider',         'Active',     null, null, 'Under review for potential migration in H2.',                  4);

-- ============================================================
-- JOIN TABLES: Link projects to systems, vendors, people
-- ============================================================
WITH proj AS (SELECT id, name FROM coeo_projects),
     sys  AS (SELECT id, name FROM coeo_systems),
     ven  AS (SELECT id, name FROM coeo_vendors),
     ppl  AS (SELECT id, name FROM coeo_people)

-- Project ↔ Systems
INSERT INTO coeo_project_systems (project_id, system_id)
SELECT p.id, s.id FROM proj p, sys s WHERE
  (p.name = 'Data Warehouse'       AND s.name = 'Data Warehouse') OR
  (p.name = 'Customer Portal'      AND s.name = 'Customer Portal') OR
  (p.name = 'Salesforce Discovery' AND s.name = 'Salesforce') OR
  (p.name = 'Salesforce Maintenance' AND s.name = 'Salesforce') OR
  (p.name = 'Provisioning Portal'  AND s.name = 'Provisioning Portal') OR
  (p.name = 'Enterprise Middleware' AND s.name = 'Carrier APIs');

-- Project ↔ Vendors (separate statement since CTEs can't span multiple DML)
WITH proj AS (SELECT id, name FROM coeo_projects),
     ven  AS (SELECT id, name FROM coeo_vendors)
INSERT INTO coeo_project_vendors (project_id, vendor_id)
SELECT p.id, v.id FROM proj p, ven v WHERE
  (p.name = 'Customer Portal'      AND v.name = 'Technovate') OR
  (p.name = 'Salesforce Discovery' AND v.name = 'SETGO');

-- Project ↔ People
WITH proj AS (SELECT id, name FROM coeo_projects),
     ppl  AS (SELECT id, name FROM coeo_people)
INSERT INTO coeo_project_people (project_id, person_id)
SELECT p.id, pp.id FROM proj p, ppl pp WHERE
  (p.name = 'Data Warehouse'         AND pp.name = 'Jack Minster') OR
  (p.name = 'Customer Portal'        AND pp.name = 'Jack Minster') OR
  (p.name = 'Customer Portal'        AND pp.name = 'Anthan Sunder') OR
  (p.name = 'Salesforce Discovery'   AND pp.name = 'Mamata Huded') OR
  (p.name = 'Salesforce Discovery'   AND pp.name = 'SETGO') OR
  (p.name = 'Salesforce Maintenance' AND pp.name = 'Mamata Huded') OR
  (p.name = 'Acquisitions'           AND pp.name = 'Jack Minster') OR
  (p.name = 'KYC'                    AND pp.name = 'Jack Minster') OR
  (p.name = 'TransUnion (Neustar)'   AND pp.name = 'Jack Minster') OR
  (p.name = 'Enterprise Middleware'   AND pp.name = 'Jack Minster') OR
  (p.name = 'Provisioning Portal'    AND pp.name = 'Sean');
