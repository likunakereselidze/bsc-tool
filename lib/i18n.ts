import type { Language } from '@/types/bsc';

export const t: Record<string, Record<Language, string>> = {
  // General
  'app.title': { ka: 'BSC Tool', en: 'BSC Tool' },
  'app.tagline': { ka: 'ექსპორტის სტრატეგიის დამგეგმავი', en: 'Export Strategy Planner' },
  'app.description': {
    ka: 'შექმენი შენი ექსპორტის დეპარტამენტის Balanced Scorecard — უფასოდ, 20 წუთში.',
    en: 'Build your export department\'s Balanced Scorecard — free, in 20 minutes.',
  },
  'btn.start': { ka: 'BSC-ის შექმნა', en: 'Create BSC' },
  'btn.save': { ka: 'შენახვა', en: 'Save' },
  'btn.add': { ka: 'დამატება', en: 'Add' },
  'btn.delete': { ka: 'წაშლა', en: 'Delete' },
  'btn.next': { ka: 'შემდეგი', en: 'Next' },
  'btn.back': { ka: 'უკან', en: 'Back' },
  'btn.finish': { ka: 'დასრულება', en: 'Finish' },
  'btn.copy_link': { ka: 'ლინკის კოპირება', en: 'Copy Link' },
  'btn.copied': { ka: 'კოპირებულია!', en: 'Copied!' },
  // Onboarding
  'onboard.title': { ka: 'კომპანიის შესახებ', en: 'About Your Company' },
  'onboard.company_name': { ka: 'კომპანიის სახელი', en: 'Company Name' },
  'onboard.company_name_placeholder': { ka: 'მაგ. ჩოხატაური Wine LLC', en: 'e.g. Chokhatauri Wine LLC' },
  'onboard.industry': { ka: 'ინდუსტრია', en: 'Industry' },
  'onboard.industry_placeholder': { ka: 'მაგ. ღვინო, ჩაი, ტექსტილი', en: 'e.g. Wine, Tea, Textiles' },
  'onboard.export_stage': { ka: 'ექსპორტის ეტაპი', en: 'Export Stage' },
  'onboard.language': { ka: 'ენა', en: 'Language' },
  // Builder steps
  'step.objectives': { ka: 'მიზნები', en: 'Objectives' },
  'step.kpis': { ka: 'KPI-ები', en: 'KPIs' },
  'step.initiatives': { ka: 'ინიციატივები', en: 'Initiatives' },
  'step.strategy_map': { ka: 'სტრატეგიული რუქა', en: 'Strategy Map' },
  'step.summary': { ka: 'შეჯამება', en: 'Summary' },
  // Objectives
  'obj.add': { ka: 'მიზნის დამატება', en: 'Add Objective' },
  'obj.title': { ka: 'მიზნის სათაური', en: 'Objective Title' },
  'obj.title_placeholder': { ka: 'მაგ. ახალ ბაზრებზე გასვლა', en: 'e.g. Enter new markets' },
  'obj.description': { ka: 'აღწერა (სურვილისამებრ)', en: 'Description (optional)' },
  'obj.empty': { ka: 'ამ პერსპექტივაში მიზანი ჯერ არ გაქვს. დაამატე პირველი!', en: 'No objectives yet for this perspective. Add your first!' },
  // KPIs
  'kpi.add': { ka: 'KPI-ის დამატება', en: 'Add KPI' },
  'kpi.name': { ka: 'KPI სახელი', en: 'KPI Name' },
  'kpi.name_placeholder': { ka: 'მაგ. ექსპორტის შემოსავლების წილი', en: 'e.g. Export revenue share' },
  'kpi.unit': { ka: 'ერთეული', en: 'Unit' },
  'kpi.unit_placeholder': { ka: 'მაგ. %, GEL, ტონა', en: 'e.g. %, GEL, tons' },
  'kpi.baseline': { ka: 'საწყისი მდგომარეობა', en: 'Baseline' },
  'kpi.target': { ka: 'სამიზნე', en: 'Target' },
  'kpi.frequency': { ka: 'გაზომვის სიხშირე', en: 'Measurement Frequency' },
  'kpi.empty': { ka: 'ამ მიზანს KPI ჯერ არ აქვს.', en: 'No KPIs yet for this objective.' },
  // Initiatives
  'init.add': { ka: 'ინიციატივის დამატება', en: 'Add Initiative' },
  'init.name': { ka: 'ინიციატივის სახელი', en: 'Initiative Name' },
  'init.name_placeholder': { ka: 'მაგ. საერთაშორისო გამოფენაში მონაწილეობა', en: 'e.g. Participate in international trade fair' },
  'init.owner': { ka: 'პასუხისმგებელი', en: 'Owner' },
  'init.deadline': { ka: 'ვადა', en: 'Deadline' },
  'init.status': { ka: 'სტატუსი', en: 'Status' },
  'init.status.planned': { ka: 'დაგეგმილი', en: 'Planned' },
  'init.status.active': { ka: 'მიმდინარე', en: 'Active' },
  'init.status.done': { ka: 'შესრულებული', en: 'Done' },
  // Summary
  'summary.title': { ka: 'შენი BSC მზადაა!', en: 'Your BSC is ready!' },
  'summary.link_label': { ka: 'შენი პირადი ლინკი', en: 'Your personal link' },
  'summary.link_info': { ka: 'ეს ლინკი მხოლოდ შენ გაქვს. შეინახე — სხვა გზით ვერ შეხვალ.', en: 'This link is only yours. Save it — there\'s no other way to access your BSC.' },
  'summary.objectives_count': { ka: 'მიზანი', en: 'objectives' },
  'summary.kpis_count': { ka: 'KPI', en: 'KPIs' },
  'summary.initiatives_count': { ka: 'ინიციატივა', en: 'initiatives' },
  // Nav
  'nav.overview': { ka: 'მიმოხილვა', en: 'Overview' },
  'nav.builder': { ka: 'ბილდერი', en: 'Builder' },
  // Errors
  'error.required': { ka: 'სავალდებულო ველი', en: 'Required field' },
  'error.not_found': { ka: 'BSC ვერ მოიძებნა', en: 'BSC not found' },
};

export function tr(key: string, lang: Language): string {
  return t[key]?.[lang] ?? key;
}
