'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  usePDF,
  Font,
} from '@react-pdf/renderer';
import type { FullSession, Perspective, Language, KpiEntry } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS, PERSPECTIVE_ACCENT as ACCENT_HEX } from '@/types/bsc';

// Noto Sans — full-coverage woff2 from Google Fonts CDN (Latin + Georgian + more)
// BscExport is client-only (ssr: false), so this fetch happens in the browser.
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0bIpQlx3QUlC5A4PNjXhFVadyB1Wk.woff2' },
    {
      src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr4AwhQ_y8hn8.woff2',
      fontWeight: 700,
    },
  ],
});

const ACCENT_LIGHT: Record<Perspective, string> = {
  financial: '#dbeafe',
  customer:  '#d1fae5',
  internal:  '#ede9fe',
  learning:  '#fef3c7',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    padding: 36,
    fontSize: 9,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
  },
  headerMeta: {
    fontSize: 8,
    color: '#6b7280',
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    gap: 4,
  },
  metaLabel: { color: '#9ca3af' },
  metaValue: { color: '#374151', fontWeight: 700 },
  section: { marginBottom: 14 },
  perspHeader: {
    padding: '6 10',
    borderRadius: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perspTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  perspDesc: {
    fontSize: 7.5,
    color: '#6b7280',
  },
  objBlock: {
    marginBottom: 8,
    marginLeft: 4,
    borderLeft: '2 solid #e5e7eb',
    paddingLeft: 8,
  },
  objTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  table: { width: '100%' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  colName:    { width: '35%', fontSize: 8 },
  colUnit:    { width: '10%', fontSize: 8 },
  colBase:    { width: '14%', fontSize: 8 },
  colTarget:  { width: '14%', fontSize: 8 },
  colActual:  { width: '14%', fontSize: 8 },
  colPct:     { width: '13%', fontSize: 8 },
  thText:     { color: '#6b7280', fontWeight: 700, fontSize: 7 },
  initRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  initName:     { width: '40%', fontSize: 8 },
  initOwner:    { width: '20%', fontSize: 8, color: '#6b7280' },
  initDeadline: { width: '20%', fontSize: 8, color: '#6b7280' },
  initStatus:   { width: '20%', fontSize: 8 },
  mapSection: {
    marginTop: 10,
    padding: '8 10',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1 solid #e5e7eb',
  },
  mapTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    color: '#111827',
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  mapLinkText: { fontSize: 8, color: '#374151' },
  mapArrow: { fontSize: 9, color: '#9ca3af' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #f3f4f6',
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

function parseNum(s: string | null): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function pctStr(baseline: string | null, target: string | null, actual: string | null): string {
  const b = parseNum(baseline), t = parseNum(target), a = parseNum(actual);
  if (b === null || t === null || a === null) return '—';
  if (t === b) return a >= t ? '100%' : '0%';
  const p = Math.max(0, Math.min(100, Math.round(((a - b) / (t - b)) * 100)));
  return `${p}%`;
}

const STATUS_LABEL: Record<string, Record<Language, string>> = {
  planned: { ka: 'გეგმა', en: 'Planned' },
  active:  { ka: 'აქტიური', en: 'Active' },
  done:    { ka: 'შესრულდა', en: 'Done' },
};

const EXPORT_STAGE_LABELS: Record<string, Record<Language, string>> = {
  pre_export:    { ka: 'ექსპორტამდელი', en: 'Pre-Export' },
  first_export:  { ka: 'პირველი ექსპორტი', en: 'First Export' },
  active_export: { ka: 'აქტიური ექსპორტი', en: 'Active Export' },
  scaling:       { ka: 'მასშტაბირება', en: 'Scaling' },
};

function BscDocument({
  session,
  lang,
  kpiEntries,
}: {
  session: FullSession;
  lang: Language;
  kpiEntries: KpiEntry[];
}) {
  function latestActual(kpiId: string): string | null {
    return kpiEntries.find((e) => e.kpi_id === kpiId)?.actual_value ?? null;
  }

  const today = new Date().toLocaleDateString('en-GB');
  const stageLabel = session.export_stage
    ? (EXPORT_STAGE_LABELS[session.export_stage]?.[lang] ?? session.export_stage)
    : null;

  return (
    <Document title={`${session.company_name} — BSC`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{session.company_name}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Balanced Scorecard</Text>
            </View>
            {session.industry && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{lang === 'ka' ? 'სექტორი: ' : 'Sector: '}</Text>
                <Text style={styles.metaValue}>{session.industry}</Text>
              </View>
            )}
            {stageLabel && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{lang === 'ka' ? 'სტადია: ' : 'Stage: '}</Text>
                <Text style={styles.metaValue}>{stageLabel}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{today}</Text>
            </View>
          </View>
        </View>

        {/* Perspectives */}
        {PERSPECTIVES.map((p) => {
          const objs = session.objectives.filter((o) => o.perspective === p);
          if (objs.length === 0) return null;
          return (
            <View key={p} style={styles.section}>
              <View style={[styles.perspHeader, { backgroundColor: ACCENT_LIGHT[p] }]}>
                <Text style={[styles.perspTitle, { color: ACCENT_HEX[p] }]}>
                  {PERSPECTIVE_LABELS[p][lang]}
                </Text>
                <Text style={styles.perspDesc}>{PERSPECTIVE_DESCRIPTIONS[p][lang]}</Text>
              </View>

              {objs.map((obj) => (
                <View key={obj.id} style={styles.objBlock}>
                  <Text style={styles.objTitle}>{obj.title}</Text>

                  {/* KPIs table */}
                  {obj.kpis.length > 0 && (
                    <View style={styles.table}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.colName, styles.thText]}>KPI</Text>
                        <Text style={[styles.colUnit, styles.thText]}>{lang === 'ka' ? 'ერთ.' : 'Unit'}</Text>
                        <Text style={[styles.colBase, styles.thText]}>{lang === 'ka' ? 'საწყ.' : 'Base'}</Text>
                        <Text style={[styles.colTarget, styles.thText]}>{lang === 'ka' ? 'სამ.' : 'Target'}</Text>
                        <Text style={[styles.colActual, styles.thText]}>{lang === 'ka' ? 'ფაქტი' : 'Actual'}</Text>
                        <Text style={[styles.colPct, styles.thText]}>%</Text>
                      </View>
                      {obj.kpis.map((kpi) => {
                        const actual = latestActual(kpi.id);
                        return (
                          <View key={kpi.id} style={styles.tableRow}>
                            <Text style={styles.colName}>{kpi.name}</Text>
                            <Text style={styles.colUnit}>{kpi.unit ?? '—'}</Text>
                            <Text style={styles.colBase}>{kpi.baseline ?? '—'}</Text>
                            <Text style={styles.colTarget}>{kpi.target ?? '—'}</Text>
                            <Text style={[styles.colActual, actual ? { fontWeight: 700, color: ACCENT_HEX[p] } : {}]}>
                              {actual ?? '—'}
                            </Text>
                            <Text style={styles.colPct}>
                              {pctStr(kpi.baseline, kpi.target, actual)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Initiatives */}
                  {obj.initiatives.length > 0 && (
                    <View style={{ marginTop: 5 }}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.initName, styles.thText]}>{lang === 'ka' ? 'ინიციატივა' : 'Initiative'}</Text>
                        <Text style={[styles.initOwner, styles.thText]}>{lang === 'ka' ? 'პასუხისმგ.' : 'Owner'}</Text>
                        <Text style={[styles.initDeadline, styles.thText]}>{lang === 'ka' ? 'ვადა' : 'Deadline'}</Text>
                        <Text style={[styles.initStatus, styles.thText]}>{lang === 'ka' ? 'სტ.' : 'Status'}</Text>
                      </View>
                      {obj.initiatives.map((init) => (
                        <View key={init.id} style={styles.initRow}>
                          <Text style={styles.initName}>{init.name}</Text>
                          <Text style={styles.initOwner}>{init.owner ?? '—'}</Text>
                          <Text style={styles.initDeadline}>{init.deadline ?? '—'}</Text>
                          <Text style={styles.initStatus}>
                            {STATUS_LABEL[init.status]?.[lang] ?? init.status}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* Strategy map links */}
        {session.strategy_map_links.length > 0 && (
          <View style={styles.mapSection}>
            <Text style={styles.mapTitle}>
              {lang === 'ka' ? 'სტრატეგიული კავშირები' : 'Strategy Map Connections'}
            </Text>
            {session.strategy_map_links.map((link) => {
              const src = session.objectives.find((o) => o.id === link.source_objective_id);
              const tgt = session.objectives.find((o) => o.id === link.target_objective_id);
              if (!src || !tgt) return null;
              return (
                <View key={link.id} style={styles.mapLink}>
                  <Text style={styles.mapLinkText}>{src.title}</Text>
                  <Text style={styles.mapArrow}> → </Text>
                  <Text style={styles.mapLinkText}>{tgt.title}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{session.company_name} — BSC</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default function BscExport({
  session,
  lang,
}: {
  session: FullSession;
  lang: Language;
}) {
  const [kpiEntries, setKpiEntries] = useState<KpiEntry[]>([]);

  useEffect(() => {
    fetch(`/api/kpi-entries?session_id=${session.id}`)
      .then((r) => r.json())
      .then((data: KpiEntry[]) => setKpiEntries(data))
      .catch(() => {/* ignore */});
  }, [session.id]);

  const totalObjectives = session.objectives.length;
  const totalKpis = session.objectives.reduce((n, o) => n + o.kpis.length, 0);
  const totalInitiatives = session.objectives.reduce((n, o) => n + o.initiatives.length, 0);
  const trackedKpis = session.objectives.reduce(
    (n, o) => n + o.kpis.filter((k) => kpiEntries.some((e) => e.kpi_id === k.id)).length,
    0
  );

  const fileName = `${session.company_name.replace(/\s+/g, '_')}_BSC.pdf`;

  // Always pass a valid document — never undefined (causes hasOwnProperty crash in react-pdf v3)
  const pdfDoc = useMemo(
    () => <BscDocument session={session} lang={lang} kpiEntries={kpiEntries} />,
    [session, lang, kpiEntries]
  );

  const [pdfInstance] = usePDF({ document: pdfDoc });

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
          {lang === 'ka' ? 'PDF ექსპორტი' : 'PDF Export'}
        </h2>
        <p className="text-sm text-gray-500">
          {lang === 'ka'
            ? 'ჩამოტვირთე BSC სრული ანგარიში PDF ფორმატში.'
            : 'Download your full BSC as a PDF report.'}
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 bg-white">
        {[
          { label: lang === 'ka' ? 'კომპანია' : 'Company', value: session.company_name },
          { label: lang === 'ka' ? 'მიზნები' : 'Objectives', value: String(totalObjectives) },
          { label: 'KPIs', value: `${totalKpis} ${lang === 'ka' ? 'სულ' : 'total'} · ${trackedKpis} ${lang === 'ka' ? 'ფაქტით' : 'tracked'}` },
          { label: lang === 'ka' ? 'ინიციატივები' : 'Initiatives', value: String(totalInitiatives) },
          { label: lang === 'ka' ? 'კავშირები' : 'Map connections', value: String(session.strategy_map_links.length) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Download button */}
      {pdfInstance.loading ? (
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white opacity-60" style={{ background: '#2563eb' }}>
          {lang === 'ka' ? 'მომზადება...' : 'Preparing PDF...'}
        </div>
      ) : pdfInstance.error ? (
        <div className="text-sm text-red-600">
          {lang === 'ka' ? 'შეცდომა PDF-ის შექმნაში' : 'Error generating PDF'}
        </div>
      ) : (
        <a
          href={pdfInstance.url ?? '#'}
          download={fileName}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#2563eb' }}
        >
          {lang === 'ka' ? 'PDF ჩამოტვირთვა' : 'Download PDF'}
        </a>
      )}
    </div>
  );
}
