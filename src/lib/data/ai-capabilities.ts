export type AiMaturity = "exploratory" | "planned" | "pilot" | "live";

export type ArchitectureLayerId = "portal" | "middleware" | "coeo" | "client";

export interface AiCapability {
  id: string;
  theme_code: string;
  title: string;
  description: string;
  maturity: AiMaturity;
  dependencies?: string[];
  architecture_layers?: ArchitectureLayerId[];
}

export const MATURITY_BADGE_VARIANT: Record<AiMaturity, string> = {
  exploratory: "blue",
  planned: "gray",
  pilot: "amber",
  live: "green",
};

export const MATURITY_LABEL: Record<AiMaturity, string> = {
  exploratory: "Exploratory",
  planned: "Planned",
  pilot: "Pilot",
  live: "Live",
};

export const AI_CAPABILITIES: AiCapability[] = [
  // T-01 — Data Quality & Integrity
  {
    id: "field-completeness-copilot",
    theme_code: "T-01",
    title: "Field Completeness Copilot",
    description:
      "Suggests likely values for missing or inconsistent Salesforce fields by learning from historically complete records, surfacing a prioritised queue for data stewards instead of bulk cleanup projects.",
    maturity: "exploratory",
    architecture_layers: ["coeo"],
  },
  {
    id: "circuit-asset-link-suggester",
    theme_code: "T-01",
    title: "Circuit-to-Asset Link Suggester",
    description:
      "Reconciles Rev.io service records with Salesforce assets by proposing likely matches from billing identifiers, circuit IDs, and account metadata — reducing the manual linkage effort behind the unified account identifier.",
    maturity: "exploratory",
    architecture_layers: ["coeo"],
  },

  // T-02 — System Integration & Architecture
  {
    id: "integration-anomaly-detection",
    theme_code: "T-02",
    title: "Integration Anomaly Detection",
    description:
      "Monitors n8n flow outputs for schema drift, unexpected nulls, and payload shape changes, flagging them before they corrupt downstream systems. Acts as a safety net for the still-maturing middleware layer.",
    maturity: "exploratory",
    dependencies: ["T-01"],
    architecture_layers: ["middleware"],
  },
  {
    id: "api-contract-drift-review",
    theme_code: "T-02",
    title: "API Contract Drift Review",
    description:
      "Compares documented API contracts against live responses across source systems, auto-generating a delta report so integration owners can catch vendor-side changes before they break orchestration.",
    maturity: "exploratory",
    architecture_layers: ["middleware", "coeo"],
  },

  // T-03 — Operational State Visibility (more mature conceptually → planned)
  {
    id: "alert-triage-summariser",
    theme_code: "T-03",
    title: "Alert Triage Summariser",
    description:
      "Collapses alert storms from Prometheus/NMS into a plain-English root-cause narrative scoped to a customer account, so NOC staff open a triage view with context rather than a thousand raw events.",
    maturity: "planned",
    dependencies: ["T-01", "T-02"],
    architecture_layers: ["coeo", "portal"],
  },
  {
    id: "predictive-service-health",
    theme_code: "T-03",
    title: "Predictive Service Health",
    description:
      "Uses historical NMS signals to flag circuits trending toward degradation before customers notice, enabling proactive outreach from the same operational state layer that powers the customer portal.",
    maturity: "planned",
    dependencies: ["T-01"],
    architecture_layers: ["coeo"],
  },

  // T-04 — Customer Visibility & Self-Service (mature → planned)
  {
    id: "invoice-qa-assistant",
    theme_code: "T-04",
    title: "Invoice Q&A Assistant",
    description:
      "Portal-embedded assistant that answers natural-language invoice questions (“why did this line go up?”) using Rev.io data, cutting the volume of billing cases that currently reach support.",
    maturity: "planned",
    dependencies: ["T-01"],
    architecture_layers: ["portal", "coeo"],
  },
  {
    id: "service-inventory-search",
    theme_code: "T-04",
    title: "Service Inventory Search",
    description:
      "Semantic search across a customer's services, circuits, and contract terms so portal users can ask for “all MPLS circuits renewing in the next 90 days” without filters or support involvement.",
    maturity: "planned",
    architecture_layers: ["portal"],
  },

  // T-05 — Identity, Access & Security
  {
    id: "access-review-summariser",
    theme_code: "T-05",
    title: "Access Review Summariser",
    description:
      "Surfaces unusual permission grants and stale role assignments ahead of quarterly access reviews, giving reviewers a ranked shortlist instead of a full RBAC export to work through.",
    maturity: "exploratory",
    architecture_layers: ["portal", "coeo"],
  },

  // T-06 — Workflow Efficiency
  {
    id: "case-draft-generator",
    theme_code: "T-06",
    title: "Case Draft Generator",
    description:
      "Pre-drafts case summaries, categorisation, and suggested next actions from inbound emails and call transcripts, so agents validate a draft instead of typing from scratch.",
    maturity: "exploratory",
    dependencies: ["T-01"],
    architecture_layers: ["coeo", "portal"],
  },
  {
    id: "quote-assembly-assistant",
    theme_code: "T-06",
    title: "Quote Assembly Assistant",
    description:
      "Assembles draft quotes from service inventory and historical pricing patterns, reducing the tribal-knowledge dependency that currently sits with a handful of account managers.",
    maturity: "exploratory",
    dependencies: ["T-01"],
    architecture_layers: ["coeo"],
  },

  // T-07 — Reporting & Analytics
  {
    id: "weekly-network-health-digest",
    theme_code: "T-07",
    title: "Weekly Network Health Digest",
    description:
      "Per-account AI-written digest covering circuit availability, incident summary, and trending risks — delivered weekly and already named as a T-07 outcome in the program charter.",
    maturity: "exploratory",
    dependencies: ["T-01", "T-03"],
    architecture_layers: ["coeo", "portal"],
  },
  {
    id: "executive-insight-generator",
    theme_code: "T-07",
    title: "Executive Insight Generator",
    description:
      "Generates natural-language commentary over executive dashboard trends so leadership gets “what changed and why” alongside the numbers, without an analyst manually writing the narrative each cycle.",
    maturity: "exploratory",
    dependencies: ["T-01"],
    architecture_layers: ["coeo"],
  },
];
