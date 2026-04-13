export interface Project {
  id: string;
  name: string;
  owner: string | null;
  status: string;
  phase_current: string | null;
  phase_next: string | null;
  key_risk: string | null;
  progress: number;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string | null;
  title: string;
  owner: string | null;
  due_date: string | null;
  status: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined field
  project_name?: string;
}

export interface Action {
  id: string;
  description: string;
  owner: string | null;
  owner_initials: string | null;
  owner_color: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined field
  project_name?: string;
}

export interface System {
  id: string;
  name: string;
  subtitle: string | null;
  category: string;
  purpose: string | null;
  status: string;
  owner: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  subtitle: string | null;
  category: string | null;
  role: string | null;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_ref: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  organization: string;
  role: string | null;
  initials: string | null;
  color: string | null;
  email: string | null;
  phone: string | null;
  focus_areas: string[];
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
