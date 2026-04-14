'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { FullSession, Perspective, Language } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS, PERSPECTIVE_THEMES } from '@/types/bsc';
import { tr } from '@/lib/i18n';
import BscTable from './BscTable';

type Step = 'table' | 'map' | 'summary';
const STEPS: Step[] = ['table', 'map', 'summary'];

const STEP_LABELS: Record<Step, Record<Language, string>> = {
  table: { ka: 'BSC ცხრილი', en: 'BSC Table' },
  map: { ka: 'სტრ. რუქა', en: 'Strategy Map' },
  summary: { ka: 'შეჯამება', en: 'Summary' },
};

const PERSPECTIVE_ACCENT: Record<Perspective, string> = {
  financial: '#2563eb',
  customer: '#059669',
  internal: '#7c3aed',
  learning: '#d97706',
};

export default function BscBuilder({ initialSession }: { initialSession: FullSession }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<FullSession>(initialSession);
  const lang = session.language as Language;

  const initialStep = (['table', 'map', 'summary'].includes(searchParams.get('step') ?? '') ? searchParams.get('step') : 'table') as Step;
  const [step, setStep] = useState<Step>(initialStep);
  const [copied, setCopied] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ source: '', target: '' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const bscUrl = `${baseUrl}/bsc/${session.id}`;

  function getObjectivesForPerspective(p: Perspective) {
    return session.objectives.filter((o) => o.perspective === p);
  }

  async function refreshSession() {
    const res = await fetch(`/api/sessions/${session.id}`);
    if (res.ok) setSession(await res.json());
  }

  async function addLink() {
    if (!linkForm.source || !linkForm.target) return;
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        source_objective_id: linkForm.source,
        target_objective_id: linkForm.target,
      }),
    });
    setLinkForm({ source: '', target: '' });
    setAddingLink(false);
    await refreshSession();
  }

  async function deleteLinkById(id: string) {
    await fetch(`/api/links/${id}`, { method: 'DELETE' });
    await refreshSession();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(bscUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function goToStep(s: Step) {
    setStep(s);
    router.replace(`/bsc/${session.id}?step=${s}`, { scroll: false });
  }

  const stepIndex = STEPS.indexOf(step);
  const totalObjectives = session.objectives.length;
  const totalKpis = session.objectives.reduce((n, o) => n + o.kpis.length, 0);
  const totalInitiatives = session.objectives.reduce((n, o) => n + o.initiatives.length, 0);

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm outline-none border border-gray-200 bg-white text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-semibold text-sm text-gray-900">BSC Tool</a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{session.company_name}</span>
            {session.industry && (
              <span className="text-xs text-gray-400 hidden sm:inline">&middot; {session.industry}</span>
            )}
          </div>
        </div>

        {/* Step nav */}
        <div className="max-w-4xl mx-auto px-6 pb-3">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => goToStep(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={step === s
                  ? { background: '#2563eb', color: '#fff' }
                  : i < stepIndex
                  ? { color: '#2563eb', background: '#eff6ff' }
                  : { color: '#9ca3af', background: 'transparent' }
                }
              >
                <span className="opacity-60">{i + 1}.</span>
                {STEP_LABELS[s][lang]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">

        {/* STEP: BSC Table */}
        {step === 'table' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'BSC ცხრილი' : 'BSC Table'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka'
                  ? 'დააჭირე ნებისმიერ უჯრაზე რედაქტირებისთვის. + ღილაკებით ამატებ ახალ მიზნებს, KPI-ებს, ინიციატივებს.'
                  : 'Click any cell to edit. Use + buttons to add objectives, KPIs, and initiatives.'}
              </p>
            </div>
            <BscTable session={session} lang={lang} onRefresh={refreshSession} />
            <div className="flex justify-end">
              <button onClick={() => goToStep('map')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: '#2563eb' }}>
                {lang === 'ka' ? 'სტრატეგიული რუქა' : 'Strategy Map'} &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP: Strategy Map */}
        {step === 'map' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                {tr('map.title', lang)}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{tr('map.subtitle', lang)}</p>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700">{tr('map.chain_label', lang)}:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['learning', 'internal', 'customer', 'financial'] as Perspective[]).map((p, i) => (
                    <span key={p} className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ background: PERSPECTIVE_ACCENT[p] }}>
                        {PERSPECTIVE_LABELS[p][lang]}
                      </span>
                      {i < 3 && <span className="text-gray-400 text-xs font-bold">&rarr;</span>}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">{tr('map.intro', lang)}</p>
              </div>
            </div>

            {/* Perspective bands */}
            {session.objectives.length === 0 ? (
              <div className="rounded-2xl p-6 text-center border border-amber-100 bg-amber-50">
                <p className="text-sm text-amber-700">{tr('map.objectives_empty', lang)}</p>
                <button onClick={() => goToStep('table')} className="mt-2 text-sm underline text-amber-700">{tr('btn.back', lang)}</button>
              </div>
            ) : (
              <div className="space-y-2">
                {PERSPECTIVES.map((p) => {
                  const objs = getObjectivesForPerspective(p);
                  return (
                    <div key={p} className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100" style={{ background: PERSPECTIVE_ACCENT[p] + '12' }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PERSPECTIVE_ACCENT[p] }} />
                        <span className="text-sm font-semibold text-gray-700">{PERSPECTIVE_LABELS[p][lang]}</span>
                        <span className="text-xs text-gray-400 ml-auto">{objs.length}</span>
                      </div>
                      <div className="px-5 py-3 bg-white min-h-[44px] flex flex-wrap gap-2 items-center">
                        {objs.length === 0 ? (
                          <span className="text-xs text-gray-300 italic">{tr('obj.empty', lang)}</span>
                        ) : objs.map((obj) => (
                          <span key={obj.id} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                            {obj.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Connections section */}
            {session.objectives.length >= 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{tr('map.connections_title', lang)}</h3>
                  <p className="text-xs text-gray-400">{tr('map.connections_hint', lang)}</p>
                </div>

                {/* Existing connections */}
                {session.strategy_map_links.length > 0 ? (
                  <div className="space-y-2">
                    {session.strategy_map_links.map((link) => {
                      const source = session.objectives.find((o) => o.id === link.source_objective_id);
                      const target = session.objectives.find((o) => o.id === link.target_objective_id);
                      if (!source || !target) return null;
                      return (
                        <div key={link.id} className="flex items-center gap-2 rounded-xl px-4 py-3 border border-gray-100 bg-gray-50 group flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0" style={{ background: PERSPECTIVE_ACCENT[source.perspective] }}>
                            {PERSPECTIVE_LABELS[source.perspective][lang]}
                          </span>
                          <span className="text-xs font-medium text-gray-800">{source.title}</span>
                          <span className="text-gray-400 text-xs font-bold shrink-0">&rarr;</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0" style={{ background: PERSPECTIVE_ACCENT[target.perspective] }}>
                            {PERSPECTIVE_LABELS[target.perspective][lang]}
                          </span>
                          <span className="text-xs font-medium text-gray-800">{target.title}</span>
                          <button onClick={() => deleteLinkById(link.id)} className="ml-auto text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none shrink-0">&times;</button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">{tr('map.no_connections', lang)}</p>
                )}

                {/* Add connection form */}
                {addingLink ? (
                  <div className="rounded-xl p-4 space-y-3 bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-500 leading-relaxed">{tr('map.connection_good_hint', lang)}</p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{tr('map.connection_source_label', lang)}</label>
                      <select
                        value={linkForm.source}
                        onChange={(e) => setLinkForm({ ...linkForm, source: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">— {lang === 'ka' ? 'აირჩიე' : 'Select'} —</option>
                        {PERSPECTIVES.map((p) => (
                          <optgroup key={p} label={PERSPECTIVE_LABELS[p][lang]}>
                            {getObjectivesForPerspective(p).map((obj) => (
                              <option key={obj.id} value={obj.id}>{obj.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{tr('map.connection_target_label', lang)}</label>
                      <select
                        value={linkForm.target}
                        onChange={(e) => setLinkForm({ ...linkForm, target: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">— {lang === 'ka' ? 'აირჩიე' : 'Select'} —</option>
                        {PERSPECTIVES.map((p) => (
                          <optgroup key={p} label={PERSPECTIVE_LABELS[p][lang]}>
                            {getObjectivesForPerspective(p).map((obj) => (
                              <option key={obj.id} value={obj.id} disabled={obj.id === linkForm.source}>{obj.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addLink}
                        disabled={!linkForm.source || !linkForm.target || linkForm.source === linkForm.target}
                        className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-40"
                        style={{ background: '#2563eb' }}
                      >
                        {tr('btn.save', lang)}
                      </button>
                      <button
                        onClick={() => { setAddingLink(false); setLinkForm({ source: '', target: '' }); }}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {tr('btn.back', lang)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingLink(true)}
                    className="text-sm font-medium"
                    style={{ color: '#f97316' }}
                  >
                    {tr('map.add_connection', lang)}
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => goToStep('table')} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">&larr; {tr('btn.back', lang)}</button>
              <button onClick={() => goToStep('summary')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: '#2563eb' }}>{lang === 'ka' ? 'შემდეგი' : 'Continue'} &rarr;</button>
            </div>
          </div>
        )}

        {/* STEP: Summary */}
        {step === 'summary' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-8 text-center bg-gray-50">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                {tr('summary.title', lang)}
              </h2>
              <p className="text-sm text-gray-500">{tr('summary.link_info', lang)}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: totalObjectives, label: tr('summary.objectives_count', lang) },
                { value: totalKpis, label: tr('summary.kpis_count', lang) },
                { value: totalInitiatives, label: tr('summary.initiatives_count', lang) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-200 p-5 text-center bg-white">
                  <div className="font-display text-4xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* BSC overview */}
            <div className="space-y-3">
              {PERSPECTIVES.map((p) => {
                const objs = getObjectivesForPerspective(p);
                if (objs.length === 0) return null;
                return (
                  <div key={p} className="rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PERSPECTIVE_ACCENT[p] }} />
                      <span className="text-sm font-semibold text-gray-700">{PERSPECTIVE_LABELS[p][lang]}</span>
                    </div>
                    <div className="p-5 space-y-2 bg-white">
                      {objs.map((obj) => (
                        <div key={obj.id} className="flex items-start gap-3">
                          <span className="text-gray-300 mt-0.5 text-xs">&#9658;</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{obj.title}</p>
                            <p className="text-xs text-gray-400">
                              {obj.kpis.length} KPI &middot; {obj.initiatives.length} {lang === 'ka' ? 'ინიციატივა' : 'initiatives'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link box */}
            <div className="rounded-2xl border border-gray-200 p-5 space-y-3 bg-white">
              <label className="block text-sm font-medium text-gray-700">{tr('summary.link_label', lang)}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={bscUrl}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono bg-gray-50 border border-gray-200 text-gray-600 outline-none"
                />
                <button
                  onClick={copyLink}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-white whitespace-nowrap transition-colors"
                  style={{ background: copied ? '#059669' : '#2563eb' }}
                >
                  {copied ? tr('btn.copied', lang) : tr('btn.copy_link', lang)}
                </button>
              </div>
            </div>

            {/* Paid upsell */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                <div>
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">
                    {lang === 'ka' ? 'შემდეგი ნაბიჯი' : 'Next step'}
                  </p>
                  <h3 className="font-display font-semibold text-gray-900 text-lg mb-2">
                    {lang === 'ka' ? '90-დღიანი სამოქმედო გეგმა' : '90-Day Action Plan'}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {lang === 'ka'
                      ? 'AI-გენერირებული გეგმა ლია კერესელიძის ექსპორტის მეთოდოლოგიით. დავალებები, ვადები, PDF ანგარიში.'
                      : "AI-generated plan using Lia Kereselidze's export methodology. Tasks, deadlines, PDF report."}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-lg font-bold text-gray-900 mb-3">150–500 GEL</p>
                  <button
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-white"
                    style={{ background: '#2563eb' }}
                    onClick={() => alert(lang === 'ka' ? 'მალე დაემატება' : 'Coming soon')}
                  >
                    {lang === 'ka' ? 'შეძენა' : 'Get Plan'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button onClick={() => goToStep('map')} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                &larr; {tr('btn.back', lang)}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
