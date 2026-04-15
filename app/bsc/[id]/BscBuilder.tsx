'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { FullSession, Perspective, Language } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS } from '@/types/bsc';
import { tr } from '@/lib/i18n';
import BscTable from './BscTable';
import BscStrategyMap from './BscStrategyMap';
import BscProgress from './BscProgress';
import BscExport from './BscExport';

type Tab = 'setup' | 'table' | 'map' | 'progress' | 'export';
const TABS: Tab[] = ['setup', 'table', 'map', 'progress', 'export'];

const TAB_LABELS: Record<Tab, Record<Language, string>> = {
  setup:    { ka: 'კომპანია',     en: 'Setup' },
  table:    { ka: 'BSC ცხრილი',  en: 'BSC Table' },
  map:      { ka: 'სტრ. რუქა',   en: 'Strategy Map' },
  progress: { ka: 'პროგრესი',    en: 'Progress' },
  export:   { ka: 'ექსპორტი',    en: 'Export' },
};

const PERSPECTIVE_ACCENT: Record<Perspective, string> = {
  financial: '#2563eb',
  customer:  '#059669',
  internal:  '#7c3aed',
  learning:  '#d97706',
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

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null);
  const [aiAccepting, setAiAccepting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
    setAiGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? 'AI generation failed');
      } else {
        setAiPreview(data);
      }
    } catch {
      setAiError('Network error');
    } finally {
      setAiGenerating(false);
    }
  }

  async function acceptAiPreview() {
    if (!aiPreview) return;
    setAiAccepting(true);
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
    setAiAccepting(false);
    await refreshSession();
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
                    : { borderBottomColor: 'transparent', color: '#6b7280' }
                }
              >
                {TAB_LABELS[t][lang]}
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
              </div>
              <button
                onClick={generateWithAi}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-60 shrink-0 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                <span>{aiGenerating ? '...' : '✦'}</span>
                {aiGenerating
                  ? (lang === 'ka' ? 'AI ამზადებს...' : 'Generating...')
                  : (lang === 'ka' ? 'AI-ით გენერაცია' : 'Generate with AI')}
              </button>
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

            <BscTable session={session} lang={lang} onRefresh={refreshSession} />
          </div>
        )}

        {/* TAB: Strategy Map */}
        {tab === 'map' && (
          <BscStrategyMap session={session} lang={lang} onRefresh={refreshSession} />
        )}

        {/* TAB: Progress */}
        {tab === 'progress' && (
          <BscProgress session={session} lang={lang} onRefresh={refreshSession} />
        )}

        {/* TAB: Export */}
        {tab === 'export' && (
          <BscExport session={session} lang={lang} />
        )}

      </main>
    </div>
  );
}
