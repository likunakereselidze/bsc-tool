'use client';

import { useEffect, useState } from 'react';
import type { FullSession, Perspective, Language, KpiEntry, BscKpi, ObjectiveWithDetails } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS, PERSPECTIVE_ACCENT as ACCENT } from '@/types/bsc';

type LoggingState = {
  kpiId: string;
  value: string;
  period: string;
  note: string;
} | null;

type ExpandedKpi = string | null;

function parseNumber(s: string | null): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function progressPercent(baseline: string | null, target: string | null, actual: string | null): number | null {
  const b = parseNumber(baseline);
  const t = parseNumber(target);
  const a = parseNumber(actual);
  if (b === null || t === null || a === null) return null;
  if (t === b) return a >= t ? 100 : 0;
  const pct = ((a - b) / (t - b)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export default function BscProgress({
  session,
  lang,
  onRefresh,
}: {
  session: FullSession;
  lang: Language;
  onRefresh: () => Promise<void>;
}) {
  const [entries, setEntries] = useState<KpiEntry[]>([]);
  const [logging, setLogging] = useState<LoggingState>(null);
  const [expanded, setExpanded] = useState<ExpandedKpi>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/kpi-entries?session_id=${session.id}`)
      .then((r) => r.json())
      .then((data: KpiEntry[]) => setEntries(data))
      .catch(() => {});
  }, [session.id]);

  function latestEntry(kpiId: string): KpiEntry | null {
    return entries.find((e) => e.kpi_id === kpiId) ?? null;
  }

  function entriesFor(kpiId: string): KpiEntry[] {
    return entries.filter((e) => e.kpi_id === kpiId);
  }

  async function logActual() {
    if (!logging || !logging.value.trim()) return;
    setSaving(true);
    const res = await fetch('/api/kpi-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kpi_id: logging.kpiId,
        actual_value: logging.value.trim(),
        period: logging.period.trim() || null,
        note: logging.note.trim() || null,
      }),
    });
    if (res.ok) {
      const entry: KpiEntry = await res.json();
      setEntries((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
    }
    setLogging(null);
    setSaving(false);
  }

  async function deleteEntry(entryId: string) {
    await fetch(`/api/kpi-entries/${entryId}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  const totalKpis = session.objectives.reduce((n, o) => n + o.kpis.length, 0);
  const trackedKpis = session.objectives.reduce(
    (n, o) => n + o.kpis.filter((k) => latestEntry(k.id) !== null).length,
    0
  );

  const inputClass =
    'px-2.5 py-1.5 rounded-lg text-xs outline-none border border-gray-200 bg-white text-gray-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
          {lang === 'ka' ? 'KPI პროგრესი' : 'KPI Progress'}
        </h2>
        <p className="text-sm text-gray-500">
          {lang === 'ka'
            ? 'ჩაწერე ფაქტიური შედეგები და დაინახე პროგრესი.'
            : 'Log actual results and track progress against your targets.'}
        </p>
      </div>

      {/* Summary strip */}
      {totalKpis > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 bg-white">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{trackedKpis}</div>
            <div className="text-xs text-gray-400">{lang === 'ka' ? 'თვალყური' : 'tracked'}</div>
          </div>
          <div className="text-gray-200 text-lg">/</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalKpis}</div>
            <div className="text-xs text-gray-400">{lang === 'ka' ? 'სულ KPI' : 'total KPIs'}</div>
          </div>
          <div className="flex-1 ml-4">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: totalKpis > 0 ? `${(trackedKpis / totalKpis) * 100}%` : '0%',
                  background: '#2563eb',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {totalKpis === 0 ? (
        <div className="rounded-2xl p-8 text-center border border-amber-100 bg-amber-50">
          <p className="text-sm text-amber-700">
            {lang === 'ka'
              ? 'ჯერ BSC ცხრილში დაამატე KPI-ები'
              : 'Add KPIs in the BSC Table first'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {PERSPECTIVES.map((p) => {
            const objs = session.objectives.filter((o) => o.perspective === p);
            if (objs.length === 0) return null;
            return (
              <div key={p} className="rounded-2xl border border-gray-200 overflow-hidden">
                {/* Perspective header */}
                <div
                  className="px-5 py-3 flex items-center gap-2 border-b border-gray-100"
                  style={{ background: ACCENT[p] + '12' }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ACCENT[p] }} />
                  <span className="text-sm font-semibold text-gray-700">
                    {PERSPECTIVE_LABELS[p][lang]}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {PERSPECTIVE_DESCRIPTIONS[p][lang]}
                  </span>
                </div>

                {/* Objectives + KPIs */}
                <div className="divide-y divide-gray-50 bg-white">
                  {objs.map((obj) => {
                    if (obj.kpis.length === 0) return null;
                    return (
                      <div key={obj.id} className="px-5 py-3 space-y-3">
                        <p className="text-xs font-semibold text-gray-700">{obj.title}</p>
                        {obj.kpis.map((kpi) => {
                          const latest = latestEntry(kpi.id);
                          const pct = progressPercent(kpi.baseline, kpi.target, latest?.actual_value ?? null);
                          const isExpanded = expanded === kpi.id;
                          const isLogging = logging?.kpiId === kpi.id;
                          const history = entriesFor(kpi.id);

                          return (
                            <div key={kpi.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                              {/* KPI row */}
                              <div className="flex items-start gap-3 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-800">{kpi.name}</span>
                                    {kpi.unit && (
                                      <span className="text-xs text-gray-400">({kpi.unit})</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                                    {kpi.baseline && (
                                      <span>{lang === 'ka' ? 'საწყ.' : 'Base'}: <b className="text-gray-600">{kpi.baseline}</b></span>
                                    )}
                                    {kpi.target && (
                                      <span>{lang === 'ka' ? 'სამ.' : 'Target'}: <b className="text-gray-600">{kpi.target}</b></span>
                                    )}
                                    {latest && (
                                      <span className="font-semibold" style={{ color: ACCENT[p] }}>
                                        {lang === 'ka' ? 'ფაქტი' : 'Actual'}: <b>{latest.actual_value}</b>
                                        {latest.period && <span className="ml-1 font-normal text-gray-400">({latest.period})</span>}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {history.length > 0 && (
                                    <button
                                      onClick={() => setExpanded(isExpanded ? null : kpi.id)}
                                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                      {isExpanded
                                        ? (lang === 'ka' ? 'დამალვა' : 'Hide')
                                        : `${history.length} ${lang === 'ka' ? 'ჩანაწ.' : 'entries'}`}
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      setLogging(
                                        isLogging
                                          ? null
                                          : { kpiId: kpi.id, value: '', period: '', note: '' }
                                      )
                                    }
                                    className="text-xs px-3 py-1 rounded-full font-medium text-white transition-colors"
                                    style={{ background: isLogging ? '#9ca3af' : ACCENT[p] }}
                                  >
                                    {isLogging
                                      ? (lang === 'ka' ? 'გაუქმება' : 'Cancel')
                                      : (lang === 'ka' ? '+ ფაქტი' : '+ Log')}
                                  </button>
                                </div>
                              </div>

                              {/* Progress bar */}
                              {pct !== null && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-400">
                                    <span>{kpi.baseline ?? '—'}</span>
                                    <span className="font-medium" style={{ color: ACCENT[p] }}>{pct}%</span>
                                    <span>{kpi.target ?? '—'}</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${pct}%`, background: ACCENT[p] }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Log form */}
                              {isLogging && (
                                <div className="pt-1 border-t border-gray-200 space-y-2">
                                  <div className="flex gap-2 flex-wrap">
                                    <input
                                      autoFocus
                                      type="text"
                                      value={logging.value}
                                      onChange={(e) => setLogging({ ...logging, value: e.target.value })}
                                      placeholder={lang === 'ka' ? 'ფაქტიური მნიშვნელობა...' : 'Actual value...'}
                                      className={inputClass + ' flex-1 min-w-[120px]'}
                                    />
                                    <input
                                      type="text"
                                      value={logging.period}
                                      onChange={(e) => setLogging({ ...logging, period: e.target.value })}
                                      placeholder={lang === 'ka' ? 'პერიოდი (Q1 2026)' : 'Period (Q1 2026)'}
                                      className={inputClass + ' w-32'}
                                    />
                                    <input
                                      type="text"
                                      value={logging.note}
                                      onChange={(e) => setLogging({ ...logging, note: e.target.value })}
                                      placeholder={lang === 'ka' ? 'შენიშვნა...' : 'Note...'}
                                      className={inputClass + ' flex-1 min-w-[120px]'}
                                    />
                                  </div>
                                  <button
                                    onClick={logActual}
                                    disabled={saving || !logging.value.trim()}
                                    className="text-xs px-4 py-1.5 rounded-full font-medium text-white disabled:opacity-40"
                                    style={{ background: ACCENT[p] }}
                                  >
                                    {saving
                                      ? (lang === 'ka' ? 'შენახვა...' : 'Saving...')
                                      : (lang === 'ka' ? 'შენახვა' : 'Save')}
                                  </button>
                                </div>
                              )}

                              {/* History */}
                              {isExpanded && history.length > 0 && (
                                <div className="pt-1 border-t border-gray-100 space-y-1">
                                  {history.map((entry) => (
                                    <div
                                      key={entry.id}
                                      className="flex items-center gap-2 text-xs text-gray-500 group/entry"
                                    >
                                      <span className="font-semibold text-gray-700">{entry.actual_value}</span>
                                      {entry.period && <span className="text-gray-400">({entry.period})</span>}
                                      {entry.note && <span className="text-gray-400 italic">{entry.note}</span>}
                                      <span className="text-gray-300 ml-auto">
                                        {new Date(entry.created_at).toLocaleDateString()}
                                      </span>
                                      <button
                                        onClick={() => deleteEntry(entry.id)}
                                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover/entry:opacity-100 transition-all leading-none"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
