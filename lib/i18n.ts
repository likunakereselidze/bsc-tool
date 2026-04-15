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
  'onboard.company_name_placeholder': { ka: 'შეიყვანე კომპანიის სახელი', en: 'Enter your company name' },
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
  'obj.title_placeholder.financial': { ka: 'მაგ. ექსპორტის შემოსავლის გაზრდა 30%-ით', en: 'e.g. Increase export revenue by 30%' },
  'obj.title_placeholder.customer': { ka: 'მაგ. ახალ ბაზარზე გასვლა', en: 'e.g. Enter a new export market' },
  'obj.title_placeholder.internal': { ka: 'მაგ. ექსპორტის დოკუმენტაციის ავტომატიზაცია', en: 'e.g. Automate export documentation' },
  'obj.title_placeholder.learning': { ka: 'მაგ. გუნდის ექსპორტის კომპეტენციის განვითარება', en: 'e.g. Build team export competency' },
  'obj.tip.financial': {
    ka: 'ფინანსური = რა ფულადი შედეგი გინდა? შემოსავალი, მოგება, ექსპორტის წილი. ✓ "ექსპორტის შემოსავლის გაზრდა 30%-ით" — ✗ "ექსპორტის შემოსავალი" (ეს KPI-ია, არა მიზანი).',
    en: 'Financial = what financial results do you want? Revenue, profit, export share. ✓ "Increase export revenue 30%" — ✗ "Export revenue" (that\'s a KPI name, not a goal).',
  },
  'obj.tip.customer': {
    ka: 'კლიენტი = ვის ემსახურები და რა ფასეულობას შესთავაზებ? ✓ "ახალ გერმანულ ბაზარზე შესვლა" — ✗ "გერმანია" (ეს ქვეყანაა, არა მიზანი).',
    en: 'Customer = who do you serve and what value do you offer? ✓ "Enter the German retail market" — ✗ "Germany" (that\'s a place, not a goal).',
  },
  'obj.tip.internal': {
    ka: 'შიდა პროცესი = რა უნდა გაუმჯობესდეს? ✓ "ექსპორტის დოკუმენტაციის დრო 5 დღემდე შემცირება" — ✗ "დოკუმენტაცია" (ეს თემაა, არა მიზანი).',
    en: 'Internal = what must improve? ✓ "Reduce export documentation time to 5 days" — ✗ "Documentation" (that\'s a topic, not a goal).',
  },
  'obj.tip.learning': {
    ka: 'სწავლა და ზრდა = გუნდი, ცოდნა, სისტემები. ✓ "გუნდის ყველა წევრმა გაიაროს ექსპორტის ტრენინგი" — ✗ "ტრენინგი" (ეს ღონისძიებაა, არა მიზანი).',
    en: 'Learning = team, knowledge, systems. ✓ "All team members complete export certification" — ✗ "Training" (that\'s an activity, not a goal).',
  },
  'obj.writing_rule': {
    ka: 'მიზანი = რა გინდა მიაღწიო, როგორ გინდა იყოს მომავალში.',
    en: 'An objective = what you want to achieve, how you want things to be in the future.',
  },
  'obj.description': { ka: 'აღწერა (სურვილისამებრ)', en: 'Description (optional)' },
  'obj.empty': { ka: 'ამ პერსპექტივაში მიზანი ჯერ არ გაქვს. დაამატე პირველი!', en: 'No objectives yet for this perspective. Add your first!' },
  // KPIs
  'kpi.add': { ka: 'KPI-ის დამატება', en: 'Add KPI' },
  'kpi.name': { ka: 'KPI სახელი', en: 'KPI Name' },
  'kpi.name_placeholder': { ka: 'მაგ. ექსპორტის შემოსავალი GEL-ში', en: 'e.g. Export revenue in GEL' },
  'kpi.unit': { ka: 'ერთეული', en: 'Unit' },
  'kpi.unit_placeholder': { ka: 'მაგ. GEL, %, დღე, ერთეული', en: 'e.g. GEL, %, days, units' },
  'kpi.baseline': { ka: 'საწყისი — ახლა როგორია?', en: 'Baseline — what is it now?' },
  'kpi.baseline_placeholder': { ka: 'მაგ. 120,000 — ახლანდელი ციფრი', en: 'e.g. 120,000 — current number' },
  'kpi.target': { ka: 'სამიზნე — სად გინდა რომ იყოს?', en: 'Target — where do you want it to be?' },
  'kpi.target_placeholder': { ka: 'მაგ. 200,000 — ეს ციფრი = მიზანი მიღწეულია', en: 'e.g. 200,000 — this number = goal achieved' },
  'kpi.frequency': { ka: 'სიხშირე', en: 'Frequency' },
  'kpi.frequency_placeholder': { ka: 'მაგ. ყოველთვიური, კვარტალური', en: 'e.g. Monthly, Quarterly' },
  'kpi.empty': { ka: 'ამ მიზანს KPI ჯერ არ აქვს.', en: 'No KPIs yet for this objective.' },
  'kpi.step_intro': {
    ka: 'KPI = ციფრი, რომელიც გეტყვის: "მიაღწიე თუ არა მიზანს?" მიზანი "შემოსავლის გაზრდა" ბუნდოვანია — KPI "ექსპორტის შემოსავალი 200,000 GEL" კი კონკრეტულია. თითო მიზანს 1–2 KPI სჭირდება.',
    en: 'A KPI is a number that tells you: "Did I achieve the goal?" The goal "Grow revenue" is vague — but KPI "Export revenue 200,000 GEL" is concrete. Each objective needs 1–2 KPIs.',
  },
  'kpi.field_name_hint': {
    ka: 'რას გაზომავ? — კონკრეტული ინდიკატორი. არა "ზრდა", არამედ "შემოსავალი GEL-ში" ან "კლიენტების რაოდენობა".',
    en: 'What will you measure? — a specific indicator. Not "growth" but "revenue in GEL" or "number of clients".',
  },
  'kpi.field_unit_hint': {
    ka: 'რა ერთეულით გამოხატავ ციფრს? GEL (ფული), % (პროცენტი), დღე (დრო), ერთეული (რაოდენობა).',
    en: 'In what unit is the number expressed? GEL (money), % (percent), days (time), units (quantity).',
  },
  'kpi.field_baseline_hint': {
    ka: 'ეს ახლანდელი ციფრია — სანამ რაიმე შეიცვლება. "როგორც არის" — არა "როგორი მინდა რომ იყოს". შეიძლება 0-ც იყოს.',
    en: 'This is the current number — before any change. "As it is now" — not "as I want it to be". Can be 0.',
  },
  'kpi.field_target_hint': {
    ka: 'ეს მომავლის ციფრია — "როგორი მინდა რომ გახდეს". ამ ციფრის მიღწევა = მიზანი შესრულდა. კონკრეტული იყოს.',
    en: 'This is the future number — "what I want it to become". Reaching this number = goal achieved. Be specific.',
  },
  'kpi.field_frequency_hint': {
    ka: 'რამდენ ხანში ერთხელ შეამოწმებ ამ ციფრს? ყოველთვიური = 12-ჯერ წელიწადში. კვარტალური = 4-ჯერ.',
    en: 'How often will you check this number? Monthly = 12 times a year. Quarterly = 4 times.',
  },
  // Initiatives
  'init.add': { ka: 'ინიციატივის დამატება', en: 'Add Initiative' },
  'init.name': { ka: 'ინიციატივის სახელი', en: 'Initiative Name' },
  'init.name_placeholder': { ka: 'მაგ. საერთაშორისო გამოფენაში მონაწილეობა', en: 'e.g. Participate in international trade fair' },
  'init.name_placeholder.financial': { ka: 'მაგ. საექსპორტო ფასების გადასინჯვა და ოპტიმიზაცია', en: 'e.g. Review and optimise export pricing structure' },
  'init.name_placeholder.customer': { ka: 'მაგ. საერთაშორისო გამოფენაში მონაწილეობა', en: 'e.g. Participate in international trade fair' },
  'init.name_placeholder.internal': { ka: 'მაგ. ექსპორტის დოკუმენტაციის შაბლონების მომზადება', en: 'e.g. Prepare standard export documentation templates' },
  'init.name_placeholder.learning': { ka: 'მაგ. გუნდის ტრენინგი საბაჟო და ლოგისტიკის საკითხებზე', en: 'e.g. Team training on customs and logistics procedures' },
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
  // Strategy Map
  'map.title': { ka: 'სტრატეგიული რუქა', en: 'Strategy Map' },
  'map.subtitle': {
    ka: 'დაუკავშირე მიზნები ერთმანეთს — აჩვენე, რა იწვევს რას.',
    en: 'Connect objectives to each other — show what causes what.',
  },
  'map.intro': {
    ka: 'სტრატეგიული რუქა ასახავს მიზეზ-შედეგობრივ კავშირს პერსპექტივებს შორის. ქვედა პერსპექტივა ქმნის საფუძველს ზედასთვის. მაგ: თუ გუნდი გაწვრთნი (სწავლა) → პროცესი გაუმჯობესდება (შიდა) → კლიენტი კმაყოფილია (კლიენტი) → შემოსავალი იზრდება (ფინანსური).',
    en: 'The strategy map shows cause-effect connections between perspectives. Lower perspectives build the foundation for those above. E.g. Train the team (learning) → Process improves (internal) → Customer satisfied (customer) → Revenue grows (financial).',
  },
  'map.chain_label': { ka: 'მიზეზ-შედეგობრივი ჯაჭვი', en: 'Causal chain' },
  'map.objectives_empty': {
    ka: 'სტრატეგიული რუქის დასაგეგმად ჯერ მიზნები დაამატე.',
    en: 'Add objectives first to build the strategy map.',
  },
  'map.connections_title': { ka: 'კავშირები', en: 'Connections' },
  'map.connections_hint': {
    ka: 'აარჩიე ორი მიზანი და მიუთითე: პირველი ეხმარება მეორის მიღწევას.',
    en: 'Select two objectives and indicate: the first enables achieving the second.',
  },
  'map.connection_source_label': { ka: 'ეს მიზანი...', en: 'This objective...' },
  'map.connection_target_label': { ka: '...ეხმარება ამ მიზნის მიღწევას:', en: '...enables this objective:' },
  'map.add_connection': { ka: '+ კავშირის დამატება', en: '+ Add Connection' },
  'map.no_connections': {
    ka: 'კავშირები ჯერ არ დამატებია. ისინი სურვილისამებრია — BSC-ი ამის გარეშეც სრულია.',
    en: 'No connections added yet. They are optional — the BSC is complete without them.',
  },
  'map.connection_good_hint': {
    ka: 'კარგი კავშირი = პირდაპირი მიზეზობრიობა. "X-ის გაუმჯობესება პირდაპირ განაპირობებს Y-ის მიღწევას". თუ ლოგიკა ბუნდოვანია — კავშირი ალბათ არარელევანტურია.',
    en: 'A good connection = direct causality. "Improving X directly enables achieving Y." If the logic is unclear — the connection is probably not meaningful.',
  },
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
