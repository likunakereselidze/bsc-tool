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
    ka: 'ოპერაციები, ლოგისტიკა, კომპლაიანსი',
    en: 'Operations, logistics, compliance',
  },
  learning: {
    ka: 'გუნდი, ტექნოლოგია, ექსპორტის შესაძლებლობები',
    en: 'Team, technology, export capabilities',
  },
};

// Sub-themes within each perspective — shown as hints in the builder
export const PERSPECTIVE_THEMES: Record<Perspective, Record<Language, { label: string; examples: string }[]>> = {
  financial: {
    ka: [
      { label: 'შემოსავლის ზრდა', examples: 'ახალი ბაზრები, მოცულობა, ახალი პროდუქტები, ახალი კლიენტები' },
      { label: 'მომგებიანობა', examples: 'მარჟის გაუმჯობესება, ხარჯების შემცირება, ეფექტიანობა' },
    ],
    en: [
      { label: 'Revenue Growth', examples: 'New markets, volume, new products, new customers' },
      { label: 'Profitability', examples: 'Margin improvement, cost reduction, efficiency' },
    ],
  },
  customer: {
    ka: [
      { label: 'ბაზარი და მოზიდვა', examples: 'ახალი გეოგრაფია, მყიდველებთან ურთიერთობა, ბრენდი' },
      { label: 'ღირებულება და ხარისხი', examples: 'სტანდარტები, სერტიფიკატები, მიწოდების ვადები, სანდოობა' },
      { label: 'ლოიალობა', examples: 'განმეორებითი შეკვეთები, გრძელვადიანი პარტნიორობა, კმაყოფილება' },
    ],
    en: [
      { label: 'Market & Acquisition', examples: 'New geographies, buyer relationships, brand' },
      { label: 'Value & Quality', examples: 'Standards, certifications, lead times, reliability' },
      { label: 'Loyalty', examples: 'Repeat orders, long-term partnerships, satisfaction' },
    ],
  },
  internal: {
    ka: [
      { label: 'ოპერაციები', examples: 'წარმოების ეფექტიანობა, ხარისხის კონტროლი, მოცულობა' },
      { label: 'მიწოდება და კომპლაიანსი', examples: 'ლოგისტიკა, საბაჟო, სერტიფიკაცია, ნორმები' },
      { label: 'სიჩქარე და ინოვაცია', examples: 'შეკვეთის დამუშავების დრო, ახალი პროდუქტები, ციფრიზაცია' },
    ],
    en: [
      { label: 'Operations', examples: 'Production efficiency, quality control, capacity' },
      { label: 'Supply Chain & Compliance', examples: 'Logistics, customs, certifications, regulations' },
      { label: 'Speed & Innovation', examples: 'Order lead time, new products, digitalisation' },
    ],
  },
  learning: {
    ka: [
      { label: 'ადამიანები', examples: 'ექსპორტის ცოდნა, ტრენინგი, გუნდის შენარჩუნება, ლიდერობა' },
      { label: 'სისტემები', examples: 'IT, ავტომატიზაცია, CRM, მონაცემები, ელ-კომერცია' },
      { label: 'ორგანიზაცია', examples: 'კულტურა, სტრატეგიის გაგება, გუნდური თანამშრომლობა' },
    ],
    en: [
      { label: 'People', examples: 'Export expertise, training, team retention, leadership' },
      { label: 'Systems', examples: 'IT, automation, CRM, data, e-commerce' },
      { label: 'Organisation', examples: 'Culture, strategy understanding, cross-team collaboration' },
    ],
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
  full_name: string | null;
  email: string | null;
  ai_generations_used: number;
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
  x: number | null;
  y: number | null;
  created_at: string;
}

export interface KpiEntry {
  id: string;
  kpi_id: string;
  actual_value: string;
  period: string | null;
  note: string | null;
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
