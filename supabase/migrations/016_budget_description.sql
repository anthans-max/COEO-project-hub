-- ============================================================
-- COEO Project Hub — Budget Entry Description
-- Adds an optional human-readable description to each ledger row
-- (e.g. "Vendor invoice for discovery services").
-- ============================================================

alter table coeo_budget_entries add column if not exists description text;
