export const PROJECT_STATUSES = [
  "Not Started",
  "In Progress",
  "On Hold",
  "Complete",
  "TBD",
  "Unknown",
] as const;

export const MILESTONE_STATUSES = [
  "Upcoming",
  "Complete",
  "At Risk",
  "Overdue",
] as const;

export const ACTION_STATUSES = [
  "Open",
  "In Progress",
  "Complete",
  "Blocked",
] as const;

export const ACTION_PRIORITIES = ["High", "Medium", "Low"] as const;

export const SYSTEM_CATEGORIES = [
  "Internal System",
  "Data Source",
  "Infrastructure",
] as const;

export const SYSTEM_STATUSES = [
  "Active",
  "In Progress",
  "Discovery underway",
  "Decision Pending",
  "To Be Decommissioned",
  "Unknown",
] as const;

export const PEOPLE_COLORS: { label: string; value: string }[] = [
  { label: "Navy", value: "#0A2342" },
  { label: "Orange", value: "#F4821F" },
  { label: "Teal", value: "#059669" },
  { label: "Green", value: "#1A5C32" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink", value: "#EC4899" },
];

export const VENDOR_STATUSES = [
  "Active",
  "Evaluating",
  "On Hold",
  "Former",
] as const;

export const DECISION_STATUSES = ["open", "in_progress", "resolved"] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const BUDGET_CATEGORIES = ["phase", "workstream"] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const BUDGET_ENTRY_TYPES = ["actual", "forecast"] as const;
export type BudgetEntryType = (typeof BUDGET_ENTRY_TYPES)[number];

export const AI_MATURITIES = ["exploratory", "planned", "pilot", "live"] as const;
export type AiMaturity = (typeof AI_MATURITIES)[number];

export const AI_MATURITY_LABELS: Record<AiMaturity, string> = {
  exploratory: "Exploratory",
  planned: "Planned",
  pilot: "Pilot",
  live: "Live",
};

export const AI_MATURITY_BADGE_VARIANT: Record<AiMaturity, string> = {
  exploratory: "blue",
  planned: "gray",
  pilot: "amber",
  live: "green",
};

export const SOURCE_PROJECTS = [
  "Customer Portal",
  "Salesforce Discovery",
  "Salesforce Maintenance",
  "Data Warehouse",
  "Enterprise Middleware",
  "Operational State Consolidation",
  "Provisioning Portal",
] as const;

// Maps status strings to badge color variants
export const STATUS_BADGE_MAP: Record<string, string> = {
  // Project statuses
  "Not Started": "gray",
  "In Progress": "blue",
  "On Hold": "amber",
  "Complete": "green",
  "TBD": "gray",
  "Unknown": "gray",
  // Milestone statuses
  "Upcoming": "blue",
  "At Risk": "amber",
  "Overdue": "red",
  // Action statuses
  "Open": "blue",
  "Blocked": "red",
  // System statuses
  "Active": "green",
  "Discovery underway": "blue",
  "Decision Pending": "amber",
  "To Be Decommissioned": "red",
  // Vendor statuses
  "Evaluating": "amber",
  "Former": "gray",
  // Program decision statuses
  "open": "amber",
  "in_progress": "blue",
  "resolved": "green",
};

// Gantt bar colors by project status
export const GANTT_BAR_COLORS: Record<string, string> = {
  "Not Started": "#C8C0B4",
  "In Progress": "#0A2342",
  "On Hold": "#F4821F",
  "Complete": "#1A5C32",
  "TBD": "#8A7E6E",
  "Unknown": "#8A7E6E",
};
