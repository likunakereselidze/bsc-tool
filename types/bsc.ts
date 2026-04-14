export type Perspective = 'customer' | 'financial' | 'internal' | 'learning';
export type InitiativeStatus = 'planned' | 'active' | 'done';
export type Language = 'ka' | 'en';

export const PERSPECTIVES: Perspective[] = ['financial', 'customer', 'internal', 'learning'];

export const PERSPECTIVE_LABELS: Record<Perspective, Record<Language, string>> = {
  financial: { ka: 'ფინანსური', en: 'Financial' },
  customer: { ka: 'კლიენტი', en: 'Customer' },
  internal: { ka: 'შიდა პროცესები', en: 'Internal Processes' },
  learning: { ka: 'სწავლა და ზრდა', en: 'Learning & Capacity' },
};

export const PERSPECTIVE_DESCRIPTIONS: Record<Perspective, Record<Language, string>> = {
  financial: {
    ka: 'შემოსავალი, მომგებიანობა, ექსპორტის მოცულობა',
    en: 'Revenue, profitability, export volume',
  },
  customer: {
    ka: 'მყიდველები, ბაზრები, კლიენტების კმაყოფილება',
    en: 'Buyers, markets, customer satisfaction',
  },
  internal: {
    ka: 'ოპერაციები, ლოჯისტიკა, კომპლაიანსი',
    en: 'Operations, logistics, compliance',
  },
  learning: {
    ka: 'გუნდი, ტექნოლოგია, ექსპორტის შესაძლებლობები',
    en: 'Team, technology, export capabilities',
  },
};

export const EXPORT_STAGES: Record<Language, { value: string; label: string }[]> = {
  ka: [
    { value: 'pre_export', label: 'ექსპორტამდელი' },
    { value: 'first_export', label: 'პირველი ექსპორტი' },
    { value: 'active_export', label: 'აქტიური ექსპორტი' },
    { value: 'scaling', label: 'მასშტაბირება' },
  ],
  en: [
    { value: 'pre_export', label: 'Pre-Export' },
    { value: 'first_export', label: 'First Export' },
    { value: 'active_export', label: 'Active Export' },
    { value: 'scaling', label: 'Scaling' },
  ],
};

export interface BscSession {
  id: string;
  company_name: string;
  industry: string | null;
  export_stage: string | null;
  language: Language;
  paid_tier: boolean;
  created_at: string;
  updated_at: string;
}

export interface BscObjective {
  id: string;
  session_id: string;
  perspective: Perspective;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface BscKpi {
  id: string;
  objective_id: string;
  name: string;
  unit: string | null;
  baseline: string | null;
  target: string | null;
  frequency: string | null;
  sort_order: number;
  created_at: string;
}

export interface BscInitiative {
  id: string;
  objective_id: string;
  name: string;
  owner: string | null;
  deadline: string | null;
  status: InitiativeStatus;
  sort_order: number;
  created_at: string;
}

export interface StrategyMapLink {
  id: string;
  session_id: string;
  source_objective_id: string;
  target_objective_id: string;
  created_at: string;
}

export interface ObjectiveWithDetails extends BscObjective {
  kpis: BscKpi[];
  initiatives: BscInitiative[];
}

export interface FullSession extends BscSession {
  objectives: ObjectiveWithDetails[];
  strategy_map_links: StrategyMapLink[];
}
