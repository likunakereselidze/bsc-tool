'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import type { FullSession, Perspective, Language } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS, PERSPECTIVE_ACCENT } from '@/types/bsc';
import { tr } from '@/lib/i18n';
import BscTable from './BscTable';
import BscProgress from './BscProgress';
import ErrorBoundary from './ErrorBoundary';

const BscStrategyMap = dynamic(() => import('./BscStrategyMap'), { ssr: false });
const BscExport = dynamic(() => import('./BscExport'), { ssr: false });

type Tab = 'setup' | 'table' | 'map' | 'progress' | 'export' | 'upgrade';
const TABS: Tab[] = ['setup', 'table', 'map', 'progress', 'export', 'upgrade'];

const TAB_LABELS: Record<Tab, Record<Language, string>> = {
  setup:    { ka: 'კომპანია',     en: 'Setup' },
  table:    { ka: 'BSC ცხრილი',  en: 'BSC Table' },
  map:      { ka: 'სტრ. რუქა',   en: 'Strategy Map' },
  progress: { ka: 'პროგრესი',    en: 'Progress' },
  export:   { ka: 'ექსპორტი',    en: 'Export' },
  upgrade:  { ka: '✦ დახმარება', en: '✦ Get Help' },
};


export default function BscBuilder({ initialSession }: { initialSession: FullSession }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<FullSession>(initialSession);
  const lang = session.language as Language;

  const rawTab = searchParams.get('tab') ?? searchParams.get('step') ?? 'table';
  const initialTab = (TABS.includes(rawTab as Tab) ? rawTab : 'table') as Tab;
  const [tab, setTab] = useState<Tab>(initialTab);

  const [copied, setCopied] = useState(false);
  const [editingSetup, setEditingSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({
    company_name: session.company_name,
    industry: session.industry ?? '',
    export_stage: session.export_stage ?? '',
  });

  type AiKpi = { name: string; unit: string; baseline: string; target: string };
  type AiObjective = { title: string; kpis: AiKpi[] };
  type AiPreview = Record<string, AiObjective[]>;

  const CALENDLY = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/likunakereselidze/30min';

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null);
  const [aiAccepting, setAiAccepting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLimitReached, setAiLimitReached] = useState(false);

  const totalObjectives = session.objectives.length;
  const objectivesWithKpis = session.objectives.filter(o => o.kpis.length > 0).length;
  const perspectivesWithObjs = PERSPECTIVES.filter(p => session.objectives.some(o => o.perspective === p)).length;
  const completionPct = totalObjectives === 0 ? 0 : Math.round(
    (perspectivesWithObjs / 4) * 50 + (objectivesWithKpis / totalObjectives) * 50
  );
  const isComplete = perspectivesWithObjs === 4 && totalObjectives > 0 && objectivesWithKpis === totalObjectives;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const bscUrl = `${baseUrl}/bsc/${session.id}`;

  async function refreshSession() {
    const res = await fetch(`/api/sessions/${session.id}`);
    if (res.ok) setSession(await res.json());
  }

  async function saveSetup() {
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupForm),
    });
    await refreshSession();
    setEditingSetup(false);
  }

  async function generateWithAi() {
    if (session.objectives.length > 0) {
      const confirmed = window.confirm(
        lang === 'ka'
          ? 'უკვე გაქვს შეყვანილი მონაცემები. AI-ს წინადადება დაემატება ახლა არსებულ შინაარსს. გაგრძელება?'
          : 'You already have content. AI suggestions will be added on top of existing data. Continue?'
      );
      if (!confirmed) return;
    }
    setAiGenerating(true);
    setAiError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'limit_reached') {
          setAiLimitReached(true);
        } else {
          setAiError(data.error ?? 'AI generation failed');
        }
      } else {
        setAiPreview(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setAiError(lang === 'ka' ? 'AI-ს მოთხოვნა დრო გადიოდა (30წ)' : 'AI request timed out (30s)');
      } else {
        setAiError('Network error');
      }
    } finally {
      clearTimeout(timeout);
      setAiGenerating(false);
    }
  }

  async function acceptAiPreview() {
    if (!aiPreview) return;
    setAiAccepting(true);
    try {
      const perspectives = ['financial', 'customer', 'internal', 'learning'] as const;
      for (const p of perspectives) {
        const objs: AiObjective[] = aiPreview[p] ?? [];
        for (const obj of objs) {
          const objRes = await fetch('/api/objectives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: session.id, perspective: p, title: obj.title }),
          });
          if (objRes.ok) {
            const newObj = await objRes.json();
            for (const kpi of obj.kpis ?? []) {
              await fetch('/api/kpis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  objective_id: newObj.id,
                  name: kpi.name,
                  unit: kpi.unit || null,
                  baseline: kpi.baseline || null,
                  target: kpi.target || null,
                }),
              });
            }
          }
        }
      }
      setAiPreview(null);
      await refreshSession();
    } finally {
      setAiAccepting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(bscUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function goToTab(t: Tab) {
    setTab(t);
    router.replace(`/bsc/${session.id}?tab=${t}`, { scroll: false });
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm outline-none border border-gray-200 bg-white text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const EXPORT_STAGE_LABELS: Record<string, Record<Language, string>> = {
    pre_export:    { ka: 'ექსპორტამდელი', en: 'Pre-Export' },
    first_export:  { ka: 'პირველი ექსპორტი', en: 'First Export' },
    active_export: { ka: 'აქტიური ექსპორტი', en: 'Active Export' },
    scaling:       { ka: 'მასშტაბირება', en: 'Scaling' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="font-semibold text-sm text-gray-900 shrink-0">BSC Tool</a>
            <span className="text-gray-300 shrink-0">/</span>
            <span className="text-sm text-gray-700 font-medium truncate">{session.company_name}</span>
            {session.industry && (
              <span className="text-xs text-gray-400 hidden sm:inline shrink-0">&middot; {session.industry}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              {copied ? (lang === 'ka' ? 'კოპირდა' : 'Copied') : (lang === 'ka' ? 'ლინკი' : 'Share link')}
            </button>
            <a
              href="/bsc/new?new=1"
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors hidden sm:inline-flex"
            >
              {lang === 'ka' ? '+ ახალი BSC' : '+ New BSC'}
            </a>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-0">
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => goToTab(t)}
                className="px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px"
                style={
                  tab === t
                    ? { borderBottomColor: '#2563eb', color: '#2563eb', background: 'transparent' }
                    : t === 'upgrade'
                    ? { borderBottomColor: 'transparent', color: '#7c3aed', fontWeight: 600 }
                    : { borderBottomColor: 'transparent', color: '#6b7280' }
                }
              >
                {TAB_LABELS[t][lang]}{t === 'export' && totalObjectives > 0 ? <span className="ml-1 text-gray-300">↓</span> : null}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        {/* TAB: Setup */}
        {tab === 'setup' && (
          <div className="max-w-lg space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'კომპანიის ინფო' : 'Company Setup'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka'
                  ? 'ეს ინფორმაცია გამოიყენება AI-გენერაციისა და PDF-ისთვის.'
                  : 'This info is used for AI generation and PDF export.'}
              </p>
            </div>

            {editingSetup ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {lang === 'ka' ? 'კომპანიის სახელი' : 'Company name'}
                  </label>
                  <input
                    value={setupForm.company_name}
                    onChange={(e) => setSetupForm({ ...setupForm, company_name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {lang === 'ka' ? 'სექტორი / ინდუსტრია' : 'Sector / Industry'}
                  </label>
                  <input
                    value={setupForm.industry}
                    onChange={(e) => setSetupForm({ ...setupForm, industry: e.target.value })}
                    placeholder={lang === 'ka' ? 'მაგ: ღვინო, ტექსტილი, IT...' : 'e.g. Wine, Textile, IT...'}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {lang === 'ka' ? 'ექსპორტის სტადია' : 'Export stage'}
                  </label>
                  <select
                    value={setupForm.export_stage}
                    onChange={(e) => setSetupForm({ ...setupForm, export_stage: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {Object.entries(EXPORT_STAGE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l[lang]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveSetup}
                    className="px-5 py-2 rounded-full text-sm font-medium text-white"
                    style={{ background: '#2563eb' }}
                  >
                    {tr('btn.save', lang)}
                  </button>
                  <button
                    onClick={() => setEditingSetup(false)}
                    className="px-5 py-2 rounded-full text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
                  >
                    {tr('btn.back', lang)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
                {[
                  { label: lang === 'ka' ? 'კომპანია' : 'Company', value: session.company_name },
                  { label: lang === 'ka' ? 'სექტორი' : 'Sector', value: session.industry || '—' },
                  { label: lang === 'ka' ? 'სტადია' : 'Stage', value: session.export_stage ? (EXPORT_STAGE_LABELS[session.export_stage]?.[lang] ?? session.export_stage) : '—' },
                  { label: lang === 'ka' ? 'ენა' : 'Language', value: session.language === 'ka' ? 'ქართული' : 'English' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {!editingSetup && (
              <button
                onClick={() => setEditingSetup(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {lang === 'ka' ? 'რედაქტირება' : 'Edit'}
              </button>
            )}

            <div className="pt-2">
              <button
                onClick={() => goToTab('table')}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: '#2563eb' }}
              >
                {lang === 'ka' ? 'BSC ცხრილზე გადასვლა' : 'Go to BSC Table'} &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB: BSC Table */}
        {tab === 'table' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
                  {lang === 'ka' ? 'BSC ცხრილი' : 'BSC Table'}
                </h2>
                <p className="text-sm text-gray-500">
                  {lang === 'ka'
                    ? 'დააჭირე ნებისმიერ უჯრაზე რედაქტირებისთვის. + ღილაკებით ამატებ ახალ მიზნებს, KPI-ებს, ინიციატივებს.'
                    : 'Click any cell to edit. Use + buttons to add objectives, KPIs, and initiatives.'}
                </p>
                {totalObjectives > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 w-32 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${completionPct}%`, background: isComplete ? '#059669' : '#2563eb' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {isComplete
                        ? (lang === 'ka' ? 'სრული ✓' : 'Complete ✓')
                        : `${completionPct}%`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  onClick={generateWithAi}
                  disabled={aiGenerating || aiLimitReached}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: aiLimitReached ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  <span>{aiGenerating ? '...' : '✦'}</span>
                  {aiGenerating
                    ? (lang === 'ka' ? 'AI ამზადებს...' : 'Generating...')
                    : aiLimitReached
                    ? (lang === 'ka' ? 'გამოყენებულია' : 'Used')
                    : (lang === 'ka' ? 'AI-ით გენერაცია' : 'Generate with AI')}
                </button>
                {aiLimitReached ? (
                  <span className="text-xs text-gray-400">
                    {lang === 'ka' ? 'უფასო: 1 გენერაცია. განახლება — მალე.' : 'Free tier: 1 generation. Upgrade coming soon.'}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {lang === 'ka' ? 'უფასო: 1 გენერაცია' : 'Free tier: 1 generation'}
                  </span>
                )}
              </div>
            </div>

            {/* AI error */}
            {aiError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
                <span>{aiError}</span>
                <button onClick={() => setAiError(null)} className="text-red-400 hover:text-red-600 ml-4">&times;</button>
              </div>
            )}

            {/* AI Preview panel */}
            {aiPreview && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">
                      {lang === 'ka' ? 'AI-ს წინადადება' : 'AI Suggestion'}
                    </p>
                    <p className="text-xs text-purple-600 mt-0.5">
                      {lang === 'ka'
                        ? 'ეს შინაარსი დაემატება ცხრილში. შენ შეგიძლია შემდეგ ნებისმიერი უჯრა შეცვალო.'
                        : 'This content will be added to your table. You can edit anything afterwards.'}
                    </p>
                  </div>
                  <button onClick={() => setAiPreview(null)} className="text-purple-400 hover:text-purple-700 text-xl leading-none shrink-0">&times;</button>
                </div>

                {(['financial', 'customer', 'internal', 'learning'] as const).map((p) => {
                  const objs: AiObjective[] = aiPreview[p] ?? [];
                  if (objs.length === 0) return null;
                  return (
                    <div key={p}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: PERSPECTIVE_ACCENT[p] }}>
                        {PERSPECTIVE_LABELS[p][lang]}
                      </p>
                      <div className="space-y-2">
                        {objs.map((obj, i) => (
                          <div key={i} className="rounded-xl bg-white border border-purple-100 px-4 py-3 space-y-1.5">
                            <p className="text-xs font-semibold text-gray-800">{obj.title}</p>
                            {obj.kpis.map((kpi, j) => (
                              <div key={j} className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                <span className="text-gray-300">&bull;</span>
                                <span className="font-medium text-gray-700">{kpi.name}</span>
                                {kpi.unit && <span className="text-gray-400">({kpi.unit})</span>}
                                {kpi.baseline && <span>{lang === 'ka' ? 'ახლა' : 'base'}: <b className="text-gray-600">{kpi.baseline}</b></span>}
                                {kpi.target && <span>→ <b className="text-gray-700">{kpi.target}</b></span>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={acceptAiPreview}
                    disabled={aiAccepting}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: '#7c3aed' }}
                  >
                    {aiAccepting
                      ? (lang === 'ka' ? 'იტვირთება...' : 'Adding...')
                      : (lang === 'ka' ? 'ყველას დამატება' : 'Accept all')}
                  </button>
                  <button
                    onClick={() => setAiPreview(null)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                  >
                    {lang === 'ka' ? 'გაუქმება' : 'Dismiss'}
                  </button>
                </div>
              </div>
            )}

            {session.objectives.length === 0 && !aiPreview && !aiGenerating && (
              <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center space-y-4">
                <p className="text-2xl">✦</p>
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">
                    {lang === 'ka' ? 'BSC ცარიელია' : 'Your BSC is empty'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lang === 'ka'
                      ? 'გამოიყენე AI, რომ 30 წამში მიიღო სრული Balanced Scorecard შენი კომპანიისთვის.'
                      : 'Use AI to get a complete Balanced Scorecard for your company in 30 seconds.'}
                  </p>
                </div>
                <button
                  onClick={generateWithAi}
                  disabled={aiGenerating || aiLimitReached}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  <span>✦</span>
                  {lang === 'ka' ? 'AI-ით გენერაცია' : 'Generate with AI'}
                </button>
                <p className="text-xs text-gray-400">
                  {lang === 'ka' ? 'ან ხელით შეავსე ქვემოთ' : 'or fill in manually below'}
                </p>
              </div>
            )}

            <BscTable session={session} lang={lang} onRefresh={refreshSession} />
          </div>
        )}

        {/* TAB: Strategy Map */}
        {tab === 'map' && (
          <ErrorBoundary>
            <BscStrategyMap session={session} lang={lang} onRefresh={refreshSession} />
          </ErrorBoundary>
        )}

        {/* TAB: Progress */}
        {tab === 'progress' && (
          <ErrorBoundary>
            <BscProgress session={session} lang={lang} onRefresh={refreshSession} />
          </ErrorBoundary>
        )}

        {/* TAB: Export */}
        {tab === 'export' && (
          <ErrorBoundary>
            <BscExport session={session} lang={lang} />
          </ErrorBoundary>
        )}

        {/* TAB: Upgrade */}
        {tab === 'upgrade' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'სტრატეგიული დახმარება' : 'Strategic Help'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka'
                  ? 'BSC-ი მხოლოდ დასაწყისია. მე პირადად დაგეხმარები სტრატეგიის განხორციელებაში.'
                  : 'The BSC is just the start. I will personally help you turn it into an executed strategy.'}
              </p>
            </div>

            {session.paid_tier && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 font-medium">
                {lang === 'ka' ? '✓ შენ უკვე გაქვს პაკეტი' : '✓ You already have a package'}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Sprint */}
              <div className="rounded-2xl border-2 border-gray-200 p-6 space-y-4 hover:border-blue-300 transition-colors">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">BSC Sprint</p>
                  <p className="text-3xl font-bold text-gray-900">$399</p>
                  <p className="text-xs text-gray-400">{lang === 'ka' ? 'ერთჯერადი გადახდა' : 'one-time'}</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ {lang === 'ka' ? '90 წუთიანი სესია' : '90-min deep session'}</li>
                  <li>✓ {lang === 'ka' ? 'BSC-ის სრული მიმოხილვა' : 'Full BSC review'}</li>
                  <li>✓ {lang === 'ka' ? 'წერილობითი სამოქმედო გეგმა' : 'Written action plan'}</li>
                  <li>✓ {lang === 'ka' ? '30-დღიანი ელ-ფოსტის მხარდაჭერა' : '30-day email follow-up'}</li>
                </ul>
                <a
                  href={`${CALENDLY}?utm_source=bsc&utm_medium=upgrade&utm_campaign=sprint`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-full text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: '#2563eb' }}
                >
                  {lang === 'ka' ? 'დაჯავშნე სესია →' : 'Book a call →'}
                </a>
              </div>

              {/* Implementation */}
              <div className="rounded-2xl border-2 border-blue-500 p-6 space-y-4 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {lang === 'ka' ? 'პოპულარული' : 'Most popular'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">BSC Implementation</p>
                  <p className="text-3xl font-bold text-gray-900">$1,200</p>
                  <p className="text-xs text-gray-400">{lang === 'ka' ? 'ერთჯერადი გადახდა' : 'one-time'}</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ {lang === 'ka' ? '3 სესია 6 კვირის განმავლობაში' : '3 sessions over 6 weeks'}</li>
                  <li>✓ {lang === 'ka' ? 'BSC ერთად ვაშენებთ' : 'BSC built together'}</li>
                  <li>✓ {lang === 'ka' ? 'სამოქმედო გეგმა + პასუხისმგებლები' : 'Action plan + owners assigned'}</li>
                  <li>✓ {lang === 'ka' ? 'პროგრესის თვალყური BSC-ში' : 'Progress tracking in BSC'}</li>
                  <li>✓ {lang === 'ka' ? 'მე-6 კვირის შემოწმება' : 'Week 6 review'}</li>
                </ul>
                <a
                  href={`${CALENDLY}?utm_source=bsc&utm_medium=upgrade&utm_campaign=implementation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-full text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: '#2563eb' }}
                >
                  {lang === 'ka' ? 'დაჯავშნე სესია →' : 'Book a call →'}
                </a>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
