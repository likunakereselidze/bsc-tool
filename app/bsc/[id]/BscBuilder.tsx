'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type {
  FullSession, Perspective, Language,
  ObjectiveWithDetails, BscKpi, BscInitiative
} from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS } from '@/types/bsc';
import { tr } from '@/lib/i18n';

type Step = 'objectives' | 'kpis' | 'initiatives' | 'summary';
const STEPS: Step[] = ['objectives', 'kpis', 'initiatives', 'summary'];

const STEP_LABELS: Record<Step, Record<Language, string>> = {
  objectives: { ka: 'მიზნები', en: 'Objectives' },
  kpis: { ka: 'KPI', en: 'KPIs' },
  initiatives: { ka: 'ინიციატივები', en: 'Initiatives' },
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

  const initialStep = (searchParams.get('step') as Step) || 'objectives';
  const [step, setStep] = useState<Step>(initialStep);
  const [activePerspective, setActivePerspective] = useState<Perspective>('financial');

  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjDesc, setNewObjDesc] = useState('');
  const [addingObj, setAddingObj] = useState(false);

  const [activeObjId, setActiveObjId] = useState<string | null>(null);
  const [kpiForm, setKpiForm] = useState({ name: '', unit: '', baseline: '', target: '', frequency: '' });
  const [addingKpi, setAddingKpi] = useState(false);

  const [initForm, setInitForm] = useState({ name: '', owner: '', deadline: '', status: 'planned' });
  const [addingInit, setAddingInit] = useState(false);

  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const bscUrl = `${baseUrl}/bsc/${session.id}`;

  function getObjectivesForPerspective(p: Perspective): ObjectiveWithDetails[] {
    return session.objectives.filter((o) => o.perspective === p);
  }

  async function refreshSession() {
    const res = await fetch(`/api/sessions/${session.id}`);
    if (res.ok) setSession(await res.json());
  }

  async function addObjective() {
    if (!newObjTitle.trim()) return;
    setAddingObj(true);
    try {
      await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          perspective: activePerspective,
          title: newObjTitle.trim(),
          description: newObjDesc.trim() || undefined,
        }),
      });
      setNewObjTitle('');
      setNewObjDesc('');
      await refreshSession();
    } finally {
      setAddingObj(false);
    }
  }

  async function deleteObjective(id: string) {
    await fetch(`/api/objectives/${id}`, { method: 'DELETE' });
    await refreshSession();
  }

  async function addKpi(objectiveId: string) {
    if (!kpiForm.name.trim()) return;
    setAddingKpi(true);
    try {
      await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective_id: objectiveId, ...kpiForm }),
      });
      setKpiForm({ name: '', unit: '', baseline: '', target: '', frequency: '' });
      setActiveObjId(null);
      await refreshSession();
    } finally {
      setAddingKpi(false);
    }
  }

  async function deleteKpi(id: string) {
    await fetch(`/api/kpis/${id}`, { method: 'DELETE' });
    await refreshSession();
  }

  async function addInitiative(objectiveId: string) {
    if (!initForm.name.trim()) return;
    setAddingInit(true);
    try {
      await fetch('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective_id: objectiveId, ...initForm }),
      });
      setInitForm({ name: '', owner: '', deadline: '', status: 'planned' });
      setActiveObjId(null);
      await refreshSession();
    } finally {
      setAddingInit(false);
    }
  }

  async function deleteInitiative(id: string) {
    await fetch(`/api/initiatives/${id}`, { method: 'DELETE' });
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
  const inputSmClass = "px-3 py-2 rounded-lg text-sm outline-none border border-gray-200 bg-white text-gray-900 transition-colors focus:border-blue-500";

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

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">

        {/* STEP: Objectives */}
        {step === 'objectives' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'სტრატეგიული მიზნები' : 'Strategic Objectives'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka' ? 'თითოეული პერსპექტივისთვის დაამატე 2–4 მიზანი.' : 'Add 2–4 objectives per perspective.'}
              </p>
            </div>

            {/* Perspective tabs */}
            <div className="flex flex-wrap gap-2">
              {PERSPECTIVES.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePerspective(p)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                  style={activePerspective === p
                    ? { background: PERSPECTIVE_ACCENT[p], color: '#fff', borderColor: PERSPECTIVE_ACCENT[p] }
                    : { background: '#fff', color: '#374151', borderColor: '#e5e5e5' }
                  }
                >
                  {PERSPECTIVE_LABELS[p][lang]}
                  <span className="ml-1.5 text-xs opacity-60">({getObjectivesForPerspective(p).length})</span>
                </button>
              ))}
            </div>

            {/* Active perspective panel */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100" style={{ background: '#f9f9f9' }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: PERSPECTIVE_ACCENT[activePerspective] }} />
                  <h3 className="font-semibold text-gray-900 text-sm">{PERSPECTIVE_LABELS[activePerspective][lang]}</h3>
                </div>
                <p className="text-xs text-gray-400 ml-4">{PERSPECTIVE_DESCRIPTIONS[activePerspective][lang]}</p>
              </div>

              <div className="p-6 space-y-4 bg-white">
                {/* Existing objectives */}
                <div className="space-y-2">
                  {getObjectivesForPerspective(activePerspective).map((obj) => (
                    <div key={obj.id} className="flex items-start justify-between rounded-xl px-4 py-3 group border border-gray-100 bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{obj.title}</p>
                        {obj.description && <p className="text-xs text-gray-400 mt-0.5">{obj.description}</p>}
                      </div>
                      <button
                        onClick={() => deleteObjective(obj.id)}
                        className="ml-4 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {getObjectivesForPerspective(activePerspective).length === 0 && (
                    <p className="text-sm text-gray-400 italic">{tr('obj.empty', lang)}</p>
                  )}
                </div>

                {/* Add objective */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <input
                    type="text"
                    value={newObjTitle}
                    onChange={(e) => setNewObjTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addObjective()}
                    placeholder={tr('obj.title_placeholder', lang)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={newObjDesc}
                    onChange={(e) => setNewObjDesc(e.target.value)}
                    placeholder={tr('obj.description', lang)}
                    className={inputClass}
                    style={{ borderColor: '#f0f0f0', color: '#6b7280' }}
                  />
                  <button
                    onClick={addObjective}
                    disabled={addingObj || !newObjTitle.trim()}
                    className="px-5 py-2 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-40"
                    style={{ background: '#2563eb' }}
                  >
                    + {tr('obj.add', lang)}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => goToStep('kpis')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: '#2563eb' }}>
                {lang === 'ka' ? 'შემდეგი' : 'Continue'} &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP: KPIs */}
        {step === 'kpis' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'შედეგების ინდიკატორები' : 'Key Performance Indicators'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka' ? 'თითო მიზანს მიანიჭე 1–2 KPI.' : 'Assign 1–2 KPIs per objective.'}
              </p>
            </div>

            {session.objectives.length === 0 ? (
              <div className="rounded-2xl p-6 text-center border border-amber-100 bg-amber-50">
                <p className="text-sm text-amber-700">{lang === 'ka' ? 'ჯერ მიზნები დაამატე.' : 'Add objectives first.'}</p>
                <button onClick={() => goToStep('objectives')} className="mt-2 text-sm underline text-amber-700">{tr('btn.back', lang)}</button>
              </div>
            ) : (
              <div className="space-y-4">
                {PERSPECTIVES.map((p) => {
                  const objs = getObjectivesForPerspective(p);
                  if (objs.length === 0) return null;
                  return (
                    <div key={p} className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PERSPECTIVE_ACCENT[p] }} />
                        <span className="text-sm font-semibold text-gray-700">{PERSPECTIVE_LABELS[p][lang]}</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {objs.map((obj) => (
                          <div key={obj.id} className="p-5 space-y-3">
                            <p className="text-sm font-semibold text-gray-900">{obj.title}</p>

                            {obj.kpis.map((kpi: BscKpi) => (
                              <div key={kpi.id} className="flex items-start justify-between rounded-xl px-4 py-3 group bg-gray-50 border border-gray-100">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{kpi.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {[kpi.unit, kpi.baseline && `baseline: ${kpi.baseline}`, kpi.target && `target: ${kpi.target}`, kpi.frequency].filter(Boolean).join(' · ')}
                                  </p>
                                </div>
                                <button onClick={() => deleteKpi(kpi.id)} className="ml-4 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none">&times;</button>
                              </div>
                            ))}

                            {activeObjId === obj.id ? (
                              <div className="rounded-xl p-4 space-y-2 bg-blue-50 border border-blue-100">
                                <input type="text" value={kpiForm.name} onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })} placeholder={tr('kpi.name_placeholder', lang)} className={inputClass} autoFocus />
                                <div className="grid grid-cols-2 gap-2">
                                  <input type="text" value={kpiForm.unit} onChange={(e) => setKpiForm({ ...kpiForm, unit: e.target.value })} placeholder={tr('kpi.unit_placeholder', lang)} className={inputSmClass} />
                                  <input type="text" value={kpiForm.frequency} onChange={(e) => setKpiForm({ ...kpiForm, frequency: e.target.value })} placeholder={lang === 'ka' ? 'სიხშირე' : 'Frequency'} className={inputSmClass} />
                                  <input type="text" value={kpiForm.baseline} onChange={(e) => setKpiForm({ ...kpiForm, baseline: e.target.value })} placeholder={tr('kpi.baseline', lang)} className={inputSmClass} />
                                  <input type="text" value={kpiForm.target} onChange={(e) => setKpiForm({ ...kpiForm, target: e.target.value })} placeholder={tr('kpi.target', lang)} className={inputSmClass} />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => addKpi(obj.id)} disabled={addingKpi || !kpiForm.name.trim()} className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-40" style={{ background: '#2563eb' }}>{tr('btn.save', lang)}</button>
                                  <button onClick={() => { setActiveObjId(null); setKpiForm({ name: '', unit: '', baseline: '', target: '', frequency: '' }); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{tr('btn.back', lang)}</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setActiveObjId(obj.id)} className="text-sm font-medium transition-colors" style={{ color: '#f97316' }}>
                                + {tr('kpi.add', lang)}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => goToStep('objectives')} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">&larr; {tr('btn.back', lang)}</button>
              <button onClick={() => goToStep('initiatives')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: '#2563eb' }}>{lang === 'ka' ? 'შემდეგი' : 'Continue'} &rarr;</button>
            </div>
          </div>
        )}

        {/* STEP: Initiatives */}
        {step === 'initiatives' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
                {lang === 'ka' ? 'სტრატეგიული ინიციატივები' : 'Strategic Initiatives'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'ka' ? 'რა ქმედებები გამოიწვევს თითოეული მიზნის მიღწევას?' : 'What actions will drive each objective?'}
              </p>
            </div>

            {session.objectives.length === 0 ? (
              <div className="rounded-2xl p-6 text-center border border-amber-100 bg-amber-50">
                <p className="text-sm text-amber-700">{lang === 'ka' ? 'ჯერ მიზნები დაამატე.' : 'Add objectives first.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {PERSPECTIVES.map((p) => {
                  const objs = getObjectivesForPerspective(p);
                  if (objs.length === 0) return null;
                  return (
                    <div key={p} className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PERSPECTIVE_ACCENT[p] }} />
                        <span className="text-sm font-semibold text-gray-700">{PERSPECTIVE_LABELS[p][lang]}</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {objs.map((obj) => (
                          <div key={obj.id} className="p-5 space-y-3">
                            <p className="text-sm font-semibold text-gray-900">{obj.title}</p>

                            {obj.initiatives.map((init: BscInitiative) => (
                              <div key={init.id} className="flex items-start justify-between rounded-xl px-4 py-3 group bg-gray-50 border border-gray-100">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{init.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {[init.owner, init.deadline, init.status !== 'planned' ? tr(`init.status.${init.status}`, lang) : null].filter(Boolean).join(' · ')}
                                  </p>
                                </div>
                                <button onClick={() => deleteInitiative(init.id)} className="ml-4 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none">&times;</button>
                              </div>
                            ))}

                            {activeObjId === obj.id ? (
                              <div className="rounded-xl p-4 space-y-2 bg-blue-50 border border-blue-100">
                                <input type="text" value={initForm.name} onChange={(e) => setInitForm({ ...initForm, name: e.target.value })} placeholder={tr('init.name_placeholder', lang)} className={inputClass} autoFocus />
                                <div className="grid grid-cols-2 gap-2">
                                  <input type="text" value={initForm.owner} onChange={(e) => setInitForm({ ...initForm, owner: e.target.value })} placeholder={tr('init.owner', lang)} className={inputSmClass} />
                                  <input type="date" value={initForm.deadline} onChange={(e) => setInitForm({ ...initForm, deadline: e.target.value })} className={inputSmClass} />
                                </div>
                                <select value={initForm.status} onChange={(e) => setInitForm({ ...initForm, status: e.target.value })} className={inputClass}>
                                  <option value="planned">{tr('init.status.planned', lang)}</option>
                                  <option value="active">{tr('init.status.active', lang)}</option>
                                  <option value="done">{tr('init.status.done', lang)}</option>
                                </select>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => addInitiative(obj.id)} disabled={addingInit || !initForm.name.trim()} className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-40" style={{ background: '#2563eb' }}>{tr('btn.save', lang)}</button>
                                  <button onClick={() => { setActiveObjId(null); setInitForm({ name: '', owner: '', deadline: '', status: 'planned' }); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{tr('btn.back', lang)}</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setActiveObjId(obj.id)} className="text-sm font-medium" style={{ color: '#f97316' }}>
                                + {tr('init.add', lang)}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => goToStep('kpis')} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">&larr; {tr('btn.back', lang)}</button>
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
              <div className="flex items-start justify-between gap-6">
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
                <div className="text-right shrink-0">
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
              <button onClick={() => goToStep('initiatives')} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                &larr; {tr('btn.back', lang)}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
