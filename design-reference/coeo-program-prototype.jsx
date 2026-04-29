import { useState } from "react";

const NAV_ITEMS = [
  { id: "strategy", label: "Strategy & Themes", icon: "◈" },
  { id: "architecture", label: "Architecture", icon: "⬡" },
  { id: "decisions", label: "Decisions", icon: "◎" },
  { id: "budget", label: "Budget", icon: "▦" },
];

const THEMES = [
  {
    id: 1,
    code: "T-01",
    title: "Data Quality & Integrity",
    icon: "⬡",
    color: "#1a6b5c",
    bg: "#f0faf7",
    description:
      "Establishing Salesforce record completeness, Rev.io service linkage, and data warehouse reliability as the foundational layer of the program. Nothing downstream is credible without clean, consistent data.",
    workstreams: ["Data Warehouse", "Salesforce Discovery", "Salesforce Maintenance"],
    outcomes: [
      "Salesforce field completeness baseline established and tracked",
      "Circuit-to-asset relationships accurately represented in data model",
      "Rev.io and Salesforce records linked via unified account identifier",
      "Data warehouse ingestion validated across all source systems",
    ],
    decisions: ["OI-001: Salesforce system-of-record confirmation", "OI-004: Rev.io API capability assessment"],
  },
  {
    id: 2,
    code: "T-02",
    title: "System Integration & Architecture",
    icon: "◈",
    color: "#1e4d8c",
    bg: "#f0f4fc",
    description:
      "Defining and building the middleware and API orchestration layer that connects all backend systems. The current logical diagram shows an open question at the middleware layer — resolving this is a prerequisite for scalable integration.",
    workstreams: ["Enterprise Middleware", "Data Warehouse", "Customer Portal"],
    outcomes: [
      "Middleware/orchestration approach agreed and documented",
      "API-first integration standards defined and adopted across all workstreams",
      "n8n orchestration layer stabilised and documented",
      "All source system integrations use versioned, documented APIs",
    ],
    decisions: ["OI-005: Network monitoring platform confirmed", "OI-009: Vendor scope allocation agreed"],
  },
  {
    id: 3,
    code: "T-03",
    title: "Operational State Visibility",
    icon: "◎",
    color: "#7c4d1e",
    bg: "#fdf6f0",
    description:
      "Giving internal staff and customers real-time visibility into service health, circuit status, and alert state. Currently siloed across SolarWinds and multiple vendor portals — consolidation via Prometheus is in progress.",
    workstreams: ["Customer Portal", "Data Warehouse", "Operational State Consolidation"],
    outcomes: [
      "Single source of truth for operational state established (Prometheus/NMS)",
      "Real-time service status surfaced in customer portal",
      "Proactive alerting linked to customer accounts",
      "SolarWinds dependency reduced or eliminated for customer-facing access",
    ],
    decisions: ["OI-005: Monitoring platform decision", "OI-001: Case management system of record"],
  },
  {
    id: 4,
    code: "T-04",
    title: "Customer Visibility & Self-Service",
    icon: "▣",
    color: "#5c1a6b",
    bg: "#faf0fc",
    description:
      "Delivering a unified customer portal that replaces fragmented phone, email, and disconnected portal touchpoints with a single self-service platform covering billing, services, support, and monitoring.",
    workstreams: ["Customer Portal"],
    outcomes: [
      "Customers can view, download, and query invoices without contacting support",
      "Full service inventory visible with circuit IDs, status, and contract terms",
      "Support cases created, tracked, and communicated via portal",
      "Contract renewal visibility with proactive notifications",
    ],
    decisions: ["OI-002: Phase 1 scope confirmation", "OI-003: SSO identity provider", "OI-006: Partner/MSP access model"],
  },
  {
    id: 5,
    code: "T-05",
    title: "Identity, Access & Security",
    icon: "◉",
    color: "#1a3d6b",
    bg: "#f0f4fa",
    description:
      "Establishing SSO, MFA, and role-based access control across the customer portal and internal systems. Coeo's Microsoft 365 environment makes Entra ID the likely identity provider — confirmation is needed to unblock auth implementation.",
    workstreams: ["Customer Portal", "Salesforce Discovery"],
    outcomes: [
      "SSO identity provider confirmed and configured",
      "Role-based access model implemented across all portal personas",
      "MFA enforced per role, manageable without Coeo involvement",
      "Customer user provisioning and deprovisioning fully self-service",
    ],
    decisions: ["OI-003: Identity provider for SSO", "OI-002: Phase 1 scope — full RBAC or simplified interim"],
  },
  {
    id: 6,
    code: "T-06",
    title: "Workflow Efficiency",
    icon: "▦",
    color: "#3d6b1a",
    bg: "#f4faf0",
    description:
      "Streamlining internal staff workflows for case management, quoting, and service activation. Where Salesforce redesign and the customer portal converge — reducing handle time and eliminating dependency on tribal knowledge.",
    workstreams: ["Salesforce Discovery", "Customer Portal", "Enterprise Middleware"],
    outcomes: [
      "Case creation and tracking unified in a single system",
      "Quoting and order tracking accessible to customers without account manager involvement",
      "Internal staff have a single screen showing service, billing, and case context per customer",
      "Handoff between teams standardised and tracked",
    ],
    decisions: ["OI-001: Case management system of record", "OI-009: Vendor scope allocation"],
  },
  {
    id: 7,
    code: "T-07",
    title: "Reporting & Analytics",
    icon: "◧",
    color: "#6b1a1a",
    bg: "#faf0f0",
    description:
      "Delivering the data warehouse's output layer — executive dashboards, scheduled report exports, and the weekly AI-generated network health digest. The value realisation theme that makes the program's investment visible to leadership.",
    workstreams: ["Data Warehouse", "Customer Portal"],
    outcomes: [
      "Executive dashboards available via data warehouse (StarRocks/coeosolutions.com)",
      "Scheduled cross-module report exports available to customers",
      "Weekly AI-generated network health digest delivered per customer account",
      "Program-level reporting available in project hub for PMO governance",
    ],
    decisions: ["OI-004: Rev.io API capabilities for billing analytics", "OI-008: Data retention requirements"],
  },
];

const WORKSTREAMS = [
  { name: "Data Warehouse", themes: ["T-01", "T-02", "T-03", "T-07"], phase: "Phase 2 – Secondary KPIs", progress: 30 },
  { name: "Customer Portal", themes: ["T-02", "T-03", "T-04", "T-05", "T-06", "T-07"], phase: "Prototype / POC", progress: 25 },
  { name: "Salesforce Discovery", themes: ["T-01", "T-05", "T-06"], phase: "Discovery & Design", progress: 20 },
  { name: "Salesforce Maintenance", themes: ["T-01"], phase: "Ongoing", progress: 40 },
  { name: "Enterprise Middleware", themes: ["T-02", "T-06"], phase: "Assessment", progress: 0 },
  { name: "Operational State Consolidation", themes: ["T-03"], phase: "In Progress", progress: 15 },
];

const DECISIONS = [
  {
    id: "OI-001",
    title: "Case Management System of Record",
    detail: "Will Salesforce remain the case management system, or will it be replaced as a result of the Salesforce Discovery program?",
    themes: ["T-01", "T-03", "T-06"],
    owner: "Coeo IT / Salesforce Discovery",
    impact: "Integration architecture for Support module cannot be finalised until resolved.",
    target: "Q2 2026",
  },
  {
    id: "OI-002",
    title: "Phase 1 Scope Confirmation",
    detail: "Is full User & Role management (SSO, MFA, invite workflows) required for Phase 1 launch, or is a simplified access model acceptable as an interim?",
    themes: ["T-04", "T-05"],
    owner: "Coeo IT / Business Stakeholders",
    impact: "Phase 1 delivery timeline and complexity.",
    target: "Q2 2026",
  },
  {
    id: "OI-003",
    title: "Identity Provider for SSO",
    detail: "Which identity provider will be used for portal SSO? Microsoft Entra ID is the likely answer given Coeo's M365 environment, but this needs confirmation.",
    themes: ["T-05"],
    owner: "Coeo IT",
    impact: "Auth implementation cannot start until confirmed.",
    target: "Q2 2026",
  },
  {
    id: "OI-004",
    title: "Rev.io API Capabilities",
    detail: "What APIs does Rev.io expose for invoice, usage, and payment data? Are there constraints affecting the Billing module scope?",
    themes: ["T-01", "T-07"],
    owner: "Coeo Finance / Rev.io",
    impact: "Billing module scope and timeline. Some capabilities may be constrained by what Rev.io's API supports.",
    target: "Q2 2026",
  },
  {
    id: "OI-005",
    title: "Network Monitoring Platform",
    detail: "What is the monitoring platform that will be the source of truth for performance data? SolarWinds → Prometheus migration in progress.",
    themes: ["T-02", "T-03"],
    owner: "Coeo IT / NOC",
    impact: "Monitoring module cannot be scoped or scheduled until confirmed.",
    target: "Q2 2026",
  },
  {
    id: "OI-006",
    title: "Partner / MSP Access Model",
    detail: "Are there Partner or MSP customers who need multi-account aggregation views in Phase 1, or is this a Phase 2 requirement?",
    themes: ["T-04"],
    owner: "Coeo Sales / Account Management",
    impact: "Multi-account architecture is more complex. If Phase 1 requires it, scope and timeline increase materially.",
    target: "Q2 2026",
  },
  {
    id: "OI-007",
    title: "Notification Channels for Phase 1",
    detail: "Email and SMS confirmed for Phase 1. Are Microsoft Teams notifications required in Phase 1, or can Teams/Slack be deferred to Phase 2?",
    themes: ["T-04"],
    owner: "Coeo IT / Business Stakeholders",
    impact: "Teams webhook integration adds scope. Decision affects Phase 1 delivery.",
    target: "Q2 2026",
  },
  {
    id: "OI-008",
    title: "Data Retention & Audit Requirements",
    detail: "What is the required retention period for case history, billing data, performance data, and access logs in the portal?",
    themes: ["T-07"],
    owner: "Coeo IT / Legal / Compliance",
    impact: "Affects storage architecture, compliance posture, and hosting cost estimates.",
    target: "Q2 2026",
  },
  {
    id: "OI-009",
    title: "Vendor Scope Allocation",
    detail: "How is delivery scope divided between Technovate, Nextian, and other vendors? The BRD covers the full program — allocation of modules to vendors needs to be agreed.",
    themes: ["T-02", "T-06"],
    owner: "Coeo IT Project Team",
    impact: "Without clarity, there is risk of scope gaps or duplication between vendors.",
    target: "Q2 2026",
  },
];

const MILESTONES = [
  { phase: "Discovery", milestone: "BRD Stakeholder Sign-off", target: "Q1 2026", status: "In Progress" },
  { phase: "Discovery", milestone: "Detailed Functional Specification — Phase 1", target: "Q2 2026", status: "Upcoming" },
  { phase: "Discovery", milestone: "Technical Architecture Sign-off", target: "Q2 2026", status: "Upcoming" },
  { phase: "POC", milestone: "Prototype / POC Demonstration", target: "Q2 2026", status: "Upcoming" },
  { phase: "POC", milestone: "POC Stakeholder Review & Sign-off", target: "Q2 2026", status: "Upcoming" },
  { phase: "Development", milestone: "Phase 1 Development Complete", target: "Q3 2026", status: "Upcoming" },
  { phase: "Development", milestone: "User Acceptance Testing", target: "Q3 2026", status: "Upcoming" },
  { phase: "Launch", milestone: "Phase 1 Go-Live", target: "Q3 2026", status: "Upcoming" },
  { phase: "Phase 2", milestone: "Phase 2 Scoping & Specification", target: "Q4 2026", status: "Upcoming" },
];

const THEME_COLORS = {
  "T-01": "#1a6b5c", "T-02": "#1e4d8c", "T-03": "#7c4d1e",
  "T-04": "#5c1a6b", "T-05": "#1a3d6b", "T-06": "#3d6b1a", "T-07": "#6b1a1a",
};

const THEME_LABELS = {
  "T-01": "Data Quality", "T-02": "Integration", "T-03": "Ops Visibility",
  "T-04": "Self-Service", "T-05": "Identity & Access", "T-06": "Workflow", "T-07": "Reporting",
};

// ── Shared Components ──────────────────────────────────────────────────────────

function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#c87d2f", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f2744", margin: "0 0 8px", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 14, color: "#5a6a7e", margin: 0, lineHeight: 1.6, maxWidth: 680 }}>{subtitle}</p>}
    </div>
  );
}

function ThemeTag({ code }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px",
      borderRadius: 3, background: THEME_COLORS[code] + "18",
      color: THEME_COLORS[code], border: `1px solid ${THEME_COLORS[code]}30`,
      letterSpacing: "0.04em", marginRight: 4, marginBottom: 4,
    }}>
      {THEME_LABELS[code]}
    </span>
  );
}

// ── Page 1: Strategy & Themes ─────────────────────────────────────────────────

function StrategyPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <SectionHeader
        label="Program · Strategy"
        title="Strategic Themes"
        subtitle="The Coeo technology program is organized around seven strategic themes that cut across all workstreams. Progress is measured by outcomes, not just project milestones."
      />

      {/* Vision block */}
      <div style={{
        background: "#0f2744", borderRadius: 10, padding: "28px 32px",
        marginBottom: 32, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(200,125,47,0.08)",
        }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#c87d2f", textTransform: "uppercase", marginBottom: 10 }}>
          Program Vision
        </div>
        <p style={{ fontSize: 16, color: "#e8edf4", margin: "0 0 16px", lineHeight: 1.7, maxWidth: 760, fontFamily: "'Georgia', serif" }}>
          To build a unified, API-first technology platform that gives Coeo customers full visibility and control over their services, while eliminating the fragmented internal tooling that increases handling time and erodes data quality.
        </p>
        <div style={{ display: "flex", gap: 32 }}>
          {[["7", "Strategic Themes"], ["3", "Core Workstreams"], ["9", "Open Decisions"], ["Q3 2026", "Phase 1 Target"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#c87d2f", fontFamily: "'Georgia', serif" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#8a9ab5", letterSpacing: "0.06em" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {THEMES.map((t) => (
          <div
            key={t.id}
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            style={{
              background: "#fff", border: `1px solid ${expanded === t.id ? t.color : "#e8ecf2"}`,
              borderRadius: 10, padding: "20px 22px", cursor: "pointer",
              transition: "all 0.2s", boxShadow: expanded === t.id ? `0 4px 20px ${t.color}20` : "0 1px 4px rgba(0,0,0,0.05)",
              gridColumn: expanded === t.id ? "1 / -1" : "auto",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: expanded === t.id ? 16 : 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8, background: t.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: t.color, flexShrink: 0,
              }}>
                {t.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.color, letterSpacing: "0.1em" }}>{t.code}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2744", lineHeight: 1.3 }}>{t.title}</div>
                {!expanded || expanded !== t.id ? (
                  <p style={{ fontSize: 12, color: "#6a7a8e", margin: "6px 0 0", lineHeight: 1.5 }}>
                    {t.description.substring(0, 100)}…
                  </p>
                ) : null}
              </div>
              <div style={{ fontSize: 16, color: "#aab5c5", marginTop: 2 }}>
                {expanded === t.id ? "▲" : "▼"}
              </div>
            </div>

            {/* Expanded content */}
            {expanded === t.id && (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 24, paddingTop: 16, borderTop: `1px solid ${t.color}20` }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Description</div>
                  <p style={{ fontSize: 13, color: "#3a4a5e", margin: 0, lineHeight: 1.7 }}>{t.description}</p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Key Outcomes</div>
                  {t.outcomes.map((o, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: t.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 12, color: "#3a4a5e", lineHeight: 1.5 }}>{o}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Contributing Workstreams</div>
                  {t.workstreams.map((w) => (
                    <div key={w} style={{
                      fontSize: 12, color: "#0f2744", background: "#f4f6fa",
                      borderRadius: 4, padding: "4px 8px", marginBottom: 4, display: "inline-block", marginRight: 4,
                    }}>{w}</div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Linked Decisions</div>
                    {t.decisions.map((d) => (
                      <div key={d} style={{ fontSize: 11, color: t.color, background: t.bg, borderRadius: 3, padding: "3px 7px", marginBottom: 3, display: "inline-block", marginRight: 4, fontWeight: 600 }}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dependency note */}
      <div style={{ marginTop: 24, background: "#f8f9fc", border: "1px solid #e8ecf2", borderRadius: 8, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Theme Dependency Note</div>
        <p style={{ fontSize: 13, color: "#5a6a7e", margin: 0, lineHeight: 1.6 }}>
          Themes T-01 and T-02 are foundational — Data Quality and System Integration must mature before Operational Visibility (T-03) is reliable, which in turn must exist before Customer Self-Service (T-04) is credible. This sequencing is reflected in the program timeline.
        </p>
      </div>
    </div>
  );
}

// ── Page 2: Architecture ──────────────────────────────────────────────────────

function ArchitecturePage() {
  const [hovered, setHovered] = useState(null);

  const layers = [
    {
      id: "portal", label: "Customer Portal", color: "#1e4d8c", bg: "#eef3fc",
      modules: ["Dashboard", "Billing", "Support", "Services", "Orders", "Account Mgmt", "Monitoring", "Auth/Authz"],
      note: "Customer-facing self-service layer. Built by Technovate / Nextian.",
    },
    {
      id: "middleware", label: "Middleware / Orchestration / API", color: "#c87d2f", bg: "#fdf4e8",
      modules: ["API Gateway", "n8n Orchestration", "Integration Bus"],
      note: "⚠ Architecture approach TBD — key open decision for Enterprise Middleware workstream.",
      warning: true,
    },
    {
      id: "coeo", label: "Coeo Systems", color: "#1a6b5c", bg: "#f0faf7",
      modules: ["Rev.io (Billing)", "Data Warehouse (StarRocks)", "CRM (Salesforce)", "NMS / SolarWinds / Prometheus", "EMS / PSX", "IdP (Entra ID)"],
      note: "Internal systems of record. Data Warehouse acts as integration hub via AWS/n8n.",
    },
    {
      id: "client", label: "Client Systems", color: "#5c1a6b", bg: "#faf0fc",
      modules: ["Customer Router", "Customer IdP"],
      note: "Customer-side infrastructure — relevant for SSO federation and monitoring.",
    },
  ];

  return (
    <div>
      <SectionHeader
        label="Program · Architecture"
        title="Ecosystem Architecture"
        subtitle="A logical view of how all systems, workstreams, and integration layers connect. The middleware layer represents the most significant open architectural decision in the program."
      />

      {/* Layer diagram */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {/* Internet */}
        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          <div style={{
            display: "inline-block", background: "#0f2744", color: "#e8edf4",
            fontSize: 12, fontWeight: 700, padding: "8px 24px", borderRadius: 20,
            letterSpacing: "0.08em",
          }}>INTERNET</div>
          <div style={{ width: 2, height: 16, background: "#c8d4e4", margin: "0 auto" }} />
        </div>

        {layers.map((layer, i) => (
          <div key={layer.id}>
            <div
              onMouseEnter={() => setHovered(layer.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === layer.id ? layer.bg : "#fff",
                border: `2px solid ${hovered === layer.id ? layer.color : "#e8ecf2"}`,
                borderRadius: 10, padding: "18px 22px",
                transition: "all 0.2s", cursor: "default",
                boxShadow: hovered === layer.id ? `0 4px 16px ${layer.color}15` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: layer.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    {layer.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#6a7a8e", lineHeight: 1.5 }}>{layer.note}</div>
                  {layer.warning && (
                    <div style={{
                      marginTop: 8, fontSize: 11, fontWeight: 700, color: "#c87d2f",
                      background: "#fdf4e8", border: "1px solid #f0d4a8", borderRadius: 4,
                      padding: "4px 8px", display: "inline-block",
                    }}>OI-002 / OI-005 — Decision Required</div>
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {layer.modules.map((m) => (
                    <div key={m} style={{
                      fontSize: 12, fontWeight: 600, color: layer.color,
                      background: layer.bg, border: `1px solid ${layer.color}30`,
                      borderRadius: 6, padding: "6px 12px",
                    }}>{m}</div>
                  ))}
                </div>
              </div>
            </div>
            {i < layers.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                <div style={{ fontSize: 16, color: "#c8d4e4" }}>↕</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data sources */}
      <div style={{ background: "#f8f9fc", border: "1px solid #e8ecf2", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Data Sources — Ingested via Data Warehouse (n8n / FTP / API)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Salesforce", "Rev.io", "RazorFlow", "Performio", "AskNicely", "Peerless Network", "Bandwidth", "Inteliquent"].map((s) => (
            <div key={s} style={{
              fontSize: 12, fontWeight: 600, color: "#0f2744",
              background: "#fff", border: "1px solid #d8e0ec",
              borderRadius: 6, padding: "6px 12px",
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Workstream map */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Workstream Contributions to Architecture Layers
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {WORKSTREAMS.map((w) => (
            <div key={w.name} style={{
              background: "#f8f9fc", borderRadius: 8, padding: "14px 16px",
              border: "1px solid #e8ecf2",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2744", marginBottom: 8 }}>{w.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {w.themes.map((t) => <ThemeTag key={t} code={t} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page 3: Decisions ─────────────────────────────────────────────────────────

function DecisionsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? DECISIONS : DECISIONS.filter((d) => d.themes.includes(filter));

  return (
    <div>
      <SectionHeader
        label="Program · Governance"
        title="Decisions & Alignment"
        subtitle="The following items require stakeholder input before the program can move into detailed specification and design. Each is framed as a decision to make, not a problem to solve."
      />

      {/* Summary strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28,
      }}>
        {[
          ["9", "Total Decisions", "#0f2744"],
          ["6", "Owner: Coeo IT", "#1e4d8c"],
          ["2", "Owner: Business", "#1a6b5c"],
          ["Q2 2026", "Target Month", "#c87d2f"],
        ].map(([val, lbl, col]) => (
          <div key={lbl} style={{
            background: "#fff", border: "1px solid #e8ecf2", borderRadius: 8,
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: col, fontFamily: "'Georgia', serif" }}>{val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", letterSpacing: "0.06em", marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Theme filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={{
          fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 4,
          border: `1px solid ${filter === "all" ? "#0f2744" : "#d8e0ec"}`,
          background: filter === "all" ? "#0f2744" : "#fff",
          color: filter === "all" ? "#fff" : "#5a6a7e",
          cursor: "pointer", letterSpacing: "0.06em",
        }}>ALL</button>
        {Object.entries(THEME_LABELS).map(([code, label]) => (
          <button key={code} onClick={() => setFilter(code)} style={{
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 4,
            border: `1px solid ${filter === code ? THEME_COLORS[code] : "#d8e0ec"}`,
            background: filter === code ? THEME_COLORS[code] + "15" : "#fff",
            color: filter === code ? THEME_COLORS[code] : "#5a6a7e",
            cursor: "pointer", letterSpacing: "0.04em",
          }}>{label}</button>
        ))}
      </div>

      {/* Decision cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((d) => (
          <div key={d.id} style={{
            background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10,
            padding: "18px 22px",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 180px 120px", gap: 16, alignItems: "start" }}>
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: "#0f2744",
                  background: "#f0f4fa", borderRadius: 5, padding: "4px 8px",
                  display: "inline-block", letterSpacing: "0.04em",
                }}>{d.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2744", marginBottom: 4 }}>{d.title}</div>
                <p style={{ fontSize: 12, color: "#5a6a7e", margin: "0 0 8px", lineHeight: 1.6 }}>{d.detail}</p>
                <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 6 }}>
                  <strong style={{ color: "#5a6a7e" }}>Impact if unresolved: </strong>{d.impact}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {d.themes.map((t) => <ThemeTag key={t} code={t} />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 3, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>Owner</div>
                <div style={{ fontSize: 12, color: "#3a4a5e", lineHeight: 1.5 }}>{d.owner}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 3, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>Target</div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "#c87d2f",
                  background: "#fdf4e8", borderRadius: 4, padding: "3px 8px",
                  display: "inline-block",
                }}>{d.target}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page 4: Budget ────────────────────────────────────────────────────────────

function BudgetPage() {
  return (
    <div>
      <SectionHeader
        label="Program · Finance"
        title="Budget & Investment"
        subtitle="Phase allocations and workstream cost estimates. To be completed with Finance and IT leadership sign-off."
      />

      {/* Placeholder notice */}
      <div style={{
        background: "#fdf4e8", border: "1px solid #f0d4a8", borderRadius: 10,
        padding: "20px 24px", marginBottom: 28, display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        <div style={{ fontSize: 20, color: "#c87d2f", marginTop: 2 }}>◈</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7c4d1e", marginBottom: 4 }}>Budget framework in preparation</div>
          <p style={{ fontSize: 12, color: "#7c4d1e", margin: 0, lineHeight: 1.6 }}>
            This section will capture phase-level investment allocations, vendor cost estimates, and workstream budgets once Finance and IT leadership have confirmed the program scope. The structure below represents the intended framework.
          </p>
        </div>
      </div>

      {/* Phase allocation skeleton */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Phase Allocation Framework
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { phase: "Discovery & POC", target: "Q1–Q2 2026", items: ["BRD & requirements", "Vendor POC demonstrations", "Architecture assessment", "Salesforce discovery"] },
            { phase: "Phase 1 Development", target: "Q2–Q3 2026", items: ["Portal build (Technovate / Nextian)", "Data warehouse extension", "Integration layer build", "UAT & launch"] },
            { phase: "Phase 2 & Ongoing", target: "Q4 2026+", items: ["Phase 2 scope TBD", "Salesforce implementation", "Enterprise middleware", "Ongoing maintenance"] },
          ].map((p) => (
            <div key={p.phase} style={{ background: "#f8f9fc", borderRadius: 8, padding: "16px 18px", border: "1px solid #e8ecf2" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2744", marginBottom: 4 }}>{p.phase}</div>
              <div style={{ fontSize: 11, color: "#c87d2f", fontWeight: 700, marginBottom: 10 }}>{p.target}</div>
              {p.items.map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ color: "#c8d4e4", fontSize: 10, marginTop: 3, flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 12, color: "#5a6a7e" }}>{item}</span>
                </div>
              ))}
              <div style={{
                marginTop: 14, padding: "8px 12px", background: "#fff",
                border: "1px dashed #d8e0ec", borderRadius: 6, textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#aab5c5" }}>Budget TBC</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workstream cost skeleton */}
      <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Workstream Estimates
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8ecf2" }}>
              {["Workstream", "Vendor(s)", "Phase", "Est. Cost", "Notes"].map((h) => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px 10px 0", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Customer Portal", "Technovate / Nextian", "Phase 1", "—", "Pending vendor scope allocation (OI-009)"],
              ["Data Warehouse", "Internal / AWS", "Ongoing", "—", "AWS infrastructure costs to be confirmed"],
              ["Salesforce Discovery", "SETGO", "Q1–Q2 2026", "—", "Discovery engagement in progress"],
              ["Salesforce Maintenance", "Internal", "Ongoing", "—", "BAU — existing budget"],
              ["Enterprise Middleware", "TBD", "Q2 2026+", "—", "Pending architecture decision"],
            ].map(([ws, vendor, phase, cost, note]) => (
              <tr key={ws} style={{ borderBottom: "1px solid #f0f4f8" }}>
                <td style={{ fontSize: 13, fontWeight: 600, color: "#0f2744", padding: "12px 12px 12px 0" }}>{ws}</td>
                <td style={{ fontSize: 12, color: "#5a6a7e", padding: "12px 12px 12px 0" }}>{vendor}</td>
                <td style={{ fontSize: 12, color: "#5a6a7e", padding: "12px 12px 12px 0" }}>{phase}</td>
                <td style={{ padding: "12px 12px 12px 0" }}>
                  <span style={{ fontSize: 11, color: "#aab5c5", background: "#f8f9fc", border: "1px dashed #d8e0ec", borderRadius: 4, padding: "3px 8px" }}>TBC</span>
                </td>
                <td style={{ fontSize: 11, color: "#8a9ab5", padding: "12px 0" }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function CoeoProgram() {
  const [activePage, setActivePage] = useState("strategy");

  const pages = {
    strategy: <StrategyPage />,
    architecture: <ArchitecturePage />,
    decisions: <DecisionsPage />,
    budget: <BudgetPage />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f4f6fa" }}>

      {/* Sidebar — mimicking the hub nav */}
      <div style={{
        width: 220, background: "#0f2744", display: "flex", flexDirection: "column",
        padding: "24px 0", flexShrink: 0,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.1em" }}>COEO PROJECT HUB</div>
          <div style={{ fontSize: 10, color: "#5a7ab5", letterSpacing: "0.08em", marginTop: 2 }}>INTERNAL OPERATIONS · 2026</div>
        </div>

        <div style={{ padding: "20px 0" }}>
          {/* Existing nav items (greyed) */}
          <div style={{ padding: "0 20px 8px", fontSize: 10, fontWeight: 700, color: "#3a5a8a", letterSpacing: "0.1em" }}>OVERVIEW</div>
          {["Dashboard"].map((item) => (
            <div key={item} style={{ padding: "7px 20px", fontSize: 13, color: "#5a7ab5", cursor: "pointer" }}>
              {item}
            </div>
          ))}

          {/* Program section — active */}
          <div style={{ padding: "16px 20px 8px", fontSize: 10, fontWeight: 700, color: "#c87d2f", letterSpacing: "0.1em", marginTop: 8 }}>PROGRAM</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                padding: "7px 20px", fontSize: 13, cursor: "pointer",
                color: activePage === item.id ? "#fff" : "#5a7ab5",
                background: activePage === item.id ? "rgba(200,125,47,0.15)" : "transparent",
                borderLeft: activePage === item.id ? "2px solid #c87d2f" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {item.label}
            </div>
          ))}

          {/* Other existing sections */}
          <div style={{ padding: "16px 20px 8px", fontSize: 10, fontWeight: 700, color: "#3a5a8a", letterSpacing: "0.1em", marginTop: 8 }}>PROJECTS</div>
          {["Project list", "Roadmap", "Milestones"].map((item) => (
            <div key={item} style={{ padding: "7px 20px", fontSize: 13, color: "#5a7ab5", cursor: "pointer" }}>{item}</div>
          ))}

          <div style={{ padding: "16px 20px 8px", fontSize: 10, fontWeight: 700, color: "#3a5a8a", letterSpacing: "0.1em", marginTop: 8 }}>REFERENCE</div>
          {["Systems", "Vendors", "People"].map((item) => (
            <div key={item} style={{ padding: "7px 20px", fontSize: 13, color: "#5a7ab5", cursor: "pointer" }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e8ecf2",
          padding: "0 32px", height: 52, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#8a9ab5" }}>Program</span>
            <span style={{ fontSize: 12, color: "#c8d4e4" }}>›</span>
            <span style={{ fontSize: 12, color: "#0f2744", fontWeight: 600 }}>
              {NAV_ITEMS.find((n) => n.id === activePage)?.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#8a9ab5" }}>TUESDAY, APRIL 21, 2026</span>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#c87d2f",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>AS</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: "32px 40px", maxWidth: 1200 }}>
          {pages[activePage]}
        </div>
      </div>
    </div>
  );
}
