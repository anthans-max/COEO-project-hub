# Product Requirements Document
## Coeo IT Hub — Internal IT Knowledge Base & Project Tracker

**Version:** 1.0  
**Date:** April 13, 2026  
**Author:** Anthan Sunder  
**Status:** Draft  

---

## 1. Overview

### 1.1 Purpose
Coeo IT Hub is an internal web application for the Coeo Solutions IT team to centralize project tracking, vendor/systems documentation, stakeholder management, action items, and executive reporting. It replaces fragmented use of Jira, SharePoint, and ad-hoc documents with a single source of truth.

### 1.2 Background
The IT team is operating across a large number of high-visibility initiatives (data warehouse, Salesforce redesign, customer portal, acquisitions) with limited project management tooling, unclear ownership, and no centralized documentation. This app is designed to address those gaps and eventually serve as an executive reporting layer.

### 1.3 Goals
- Provide a single source of truth for all active IT initiatives
- Reduce coordination overhead for a small, overloaded IT team
- Enable clear ownership and accountability for action items
- Create a foundation for executive-level reporting as the team matures
- Be lightweight enough to maintain without dedicated PM tooling

---

## 2. Users & Access

### 2.1 User Personas

| Persona | Description | Primary Use |
|---|---|---|
| IT Consultant (Anthan) | Primary admin and content owner | Full edit access, synthesis, reporting |
| IT Lead (Jack) | Project owner and decision maker | View and edit projects, actions, milestones |
| IT Team Members | Mamata, Sean, others | View and update their own items |
| Executives (future) | C-suite, VPs | Read-only dashboard and status reports |

### 2.2 Access Model — Phase 1
- Anyone with the URL can view and edit
- No login required
- Single shared environment

### 2.3 Access Model — Phase 2 (future)
- Microsoft Entra ID (Azure AD) SSO via MSAL
- Role-based access: Admin, Editor, Viewer
- Row-level security in Supabase tied to user roles
- Exec view is read-only with curated dashboard

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Realtime) |
| Auth (Phase 2) | Supabase Auth + Azure AD SAML/OIDC |
| Hosting | Vercel |
| Version Control | GitHub |

### 3.1 Design System
- Brand colors: Coeo navy (`#0A2342`), orange accent (`#F4821F`), white backgrounds
- Clean, professional B2B aesthetic matching coeosolutions.com
- Mobile-responsive (team may access on tablet/mobile)

---

## 4. Core Modules

### 4.1 Dashboard (Home)
**Purpose:** At-a-glance status view for the whole IT portfolio.

**Requirements:**
- Summary metric cards: total active projects, open actions, upcoming milestones, overdue items
- Project status summary list (name, owner, status badge, progress bar)
- My open actions widget (filtered to current user — Phase 2; all actions in Phase 1)
- Upcoming milestones (next 30 days)
- Last updated timestamp per section
- Quick-add button for new action items

---

### 4.2 Projects & Roadmap

#### 4.2.1 Project List View
**Requirements:**
- Table/card view of all projects
- Fields per project:
  - Name
  - Owner(s)
  - Status (Not Started / In Progress / On Hold / Complete / TBD / Unknown)
  - Current phase description
  - Next phase description
  - Progress (0–100%, displayed as progress bar)
  - Key risks / open questions
  - Notes / description
  - Start date, target end date
  - Created / updated timestamps
- Inline editing of all fields (click to edit, auto-save to Supabase)
- Add new project button
- Delete project (with confirmation)
- Filter by status, owner

#### 4.2.2 Gantt / Roadmap View
**Requirements:**
- Timeline view grouped by quarter (Q1–Q4 2026 at minimum, extendable)
- Each project rendered as a horizontal bar spanning its date range
- Color-coded by status
- Milestone markers (diamonds) on the timeline
- Hover tooltip showing project name, owner, current phase, status
- Click on a project bar to open detail panel (side drawer)
- Zoom: quarter view and month view
- Read-only in initial phase; editable drag-to-resize in Phase 2

#### 4.2.3 Project Detail View
**Requirements:**
- Dedicated page or side drawer per project
- All project fields editable inline
- Linked milestones list (see 4.3)
- Linked action items (see 4.4)
- Linked stakeholders
- Activity log (who changed what, when) — Phase 2
- Notes / rich text field

---

### 4.3 Milestones & Key Dates

**Purpose:** Track discrete deliverables, decisions, and deadlines across all projects.

**Requirements:**
- Fields per milestone:
  - Title
  - Project (linked)
  - Owner
  - Due date
  - Status (Upcoming / Complete / At Risk / Overdue)
  - Notes
- Milestone list view (sortable by date, project, status)
- Milestones appear on the Gantt timeline (4.2.2)
- Milestones appear in the Dashboard "upcoming" widget
- Overdue milestones flagged visually (red indicator)
- Inline editing, add, delete

---

### 4.4 Action Items

**Purpose:** Track all open tasks and commitments across people and projects.

**Requirements:**
- Fields per action:
  - Description
  - Owner (person)
  - Status (Open / In Progress / Complete / Blocked)
  - Due date (optional)
  - Priority (High / Medium / Low)
  - Linked project (optional)
  - Notes
  - Created date
- List view grouped by owner
- Filter by: owner, status, project, priority
- Sort by: due date, created date, priority
- Inline editing
- Checkbox to mark complete (with visual strikethrough)
- Bulk status update
- Completed items collapsible / archivable

---

### 4.5 Systems & Vendors

#### 4.5.1 Systems Inventory
**Requirements:**
- Fields per system:
  - Name
  - Subtitle / category description
  - Category (Internal System / Data Source / Infrastructure)
  - Purpose / description
  - Status (Active / In Progress / Decision Pending / To Be Decommissioned / Fragmented / Unknown)
  - Owner / primary contact
  - Linked vendor(s)
  - Linked project(s)
  - Notes
- Card grid view and table view (toggle)
- Inline editing
- Add / delete

#### 4.5.2 Vendor Directory
**Requirements:**
- Fields per vendor:
  - Name
  - Category (Salesforce Partner / Portal Vendor / Carrier / etc.)
  - Role / engagement description
  - Status (Active / Evaluating / On Hold / Former)
  - Primary contact name + email + phone
  - Contract / SOW reference (text field, link in Phase 2)
  - Linked project(s)
  - Notes
- Card and table view
- Inline editing
- Add / delete

---

### 4.6 Stakeholders & People

**Purpose:** Track key contacts — internal team, vendor contacts, and executives.

**Requirements:**
- Fields per person:
  - Name
  - Organization (Coeo Internal / Vendor name / External)
  - Role / title
  - Initials + color (for avatar display)
  - Email
  - Phone (optional)
  - Focus areas / projects (tags)
  - Notes
- Card view with avatar, name, role, focus area badges
- Click to expand contact details
- Inline editing
- Add / delete
- Filter by organization

---

### 4.7 Reporting (Executive View)

**Purpose:** Provide a clean, shareable status view for leadership. Phase 2 priority but architecture should support it from day one.

**Phase 1 requirements:**
- Printable / exportable project status summary (PDF or print-friendly layout)
- Status-at-a-glance per project with RAG (Red / Amber / Green) indicator
- Open action count by owner

**Phase 2 requirements:**
- Dedicated `/exec` route with read-only simplified dashboard
- Filterable by time period
- Export to PDF
- Optionally: public shareable link with token (no login required for execs)
- Email digest (weekly summary) — stretch goal

---

## 5. Data Model

```
projects
  id, name, owner, status, phase_current, phase_next,
  key_risk, progress, notes, start_date, end_date,
  sort_order, created_at, updated_at

milestones
  id, project_id (fk), title, owner, due_date, status,
  notes, created_at, updated_at

actions
  id, description, owner, owner_initials, owner_color,
  status, priority, due_date, project_id (fk, nullable),
  notes, sort_order, created_at, updated_at

systems
  id, name, subtitle, category, purpose, status, owner,
  notes, sort_order, created_at, updated_at

vendors
  id, name, subtitle, category, role, status,
  contact_name, contact_email, contact_phone,
  contract_ref, notes, sort_order, created_at, updated_at

people
  id, name, organization, role, initials, color,
  email, phone, focus_areas (text[]),
  notes, sort_order, created_at, updated_at

project_systems (join)
  project_id, system_id

project_vendors (join)
  project_id, vendor_id

project_people (join)
  project_id, person_id
```

---

## 6. Navigation Structure

```
/                    → Dashboard (home)
/projects            → Project list view
/projects/roadmap    → Gantt / timeline view
/projects/[id]       → Project detail
/milestones          → Milestone list
/actions             → Action items
/systems             → Systems inventory
/vendors             → Vendor directory
/people              → Stakeholders
/reporting           → Exec reporting (Phase 2)
```

---

## 7. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Performance | Page load < 2s; optimistic UI updates on edits |
| Responsiveness | Fully usable on tablet; readable on mobile |
| Realtime | Supabase Realtime subscriptions so two users see live updates |
| Persistence | All edits auto-save to Supabase on blur / debounce |
| Error handling | Toast notifications for save errors; retry logic |
| Empty states | Helpful prompts when sections have no data |
| Accessibility | WCAG AA compliant, keyboard navigable |

---

## 8. Out of Scope (Phase 1)

- Microsoft SSO / auth (Phase 2)
- File/document uploads or attachments
- Comments or @mentions
- Email notifications
- Integration with Jira, SharePoint, or other tools
- Time tracking
- Budget tracking

---

## 9. Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | What BSS platform is the migration targeting in H2? | Jack | High |
| 2 | Salesforce: refactor or rebuild decision timeline? | Mamata / SETGO | High |
| 3 | CRM standardization: Salesforce vs Zoho — when does exec decision need to happen? | Jack | High |
| 4 | Will execs need their own login or is a shareable link sufficient? | Anthan / Jack | Medium |
| 5 | Should vendor contracts / SOWs be stored here or linked from SharePoint? | Jack | Low |
| 6 | Is there an existing Jira project structure to mirror or replace? | Jack | Medium |

---

## 10. Milestones & Delivery

| Phase | Scope | Target |
|---|---|---|
| Phase 1 — MVP | Dashboard, Projects, Actions, Systems/Vendors, People. Full inline editing. Shareable link, no auth. | 2 weeks |
| Phase 1.5 — Gantt | Roadmap / Gantt view, Milestones module | +1 week |
| Phase 2 — Auth + Reporting | Microsoft SSO, role-based access, exec reporting view, PDF export | TBD |

---

## 11. Seed Data
All data captured from the April 13, 2026 kickoff meeting with Jack Minster is available as SQL seed data in `/supabase/migrations/001_initial.sql` and should be pre-loaded on first deploy.
