'use client';

import { useState } from 'react';
import type { FullSession, Perspective, Language, ObjectiveWithDetails, BscKpi, BscInitiative } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS, PERSPECTIVE_DESCRIPTIONS, PERSPECTIVE_ACCENT as ACCENT } from '@/types/bsc';
import { tr } from '@/lib/i18n';

type EditState = {
  type: 'objective' | 'kpi' | 'initiative';
  id: string;
  field: string;
  value: string;
} | null;

export default function BscTable({
  session,
  lang,
  onRefresh,
}: {
  session: FullSession;
  lang: Language;
  onRefresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<EditState>(null);
  const [addingObjFor, setAddingObjFor] = useState<Perspective | null>(null);
  const [addingKpiFor, setAddingKpiFor] = useState<string | null>(null);
  const [addingInitFor, setAddingInitFor] = useState<string | null>(null);
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newKpi, setNewKpi] = useState({ name: '', unit: '', baseline: '', target: '', frequency: '' });
  const [newInit, setNewInit] = useState({ name: '', owner: '', deadline: '', status: 'planned' });

  function getObjs(p: Perspective): ObjectiveWithDetails[] {
    return session.objectives.filter((o) => o.perspective === p);
  }

  async function commitEdit(override?: EditState) {
    const e = override ?? editing;
    if (!e) return;
    const { type, id, field, value } = e;
    const path = type === 'objective' ? 'objectives' : type === 'kpi' ? 'kpis' : 'initiatives';
    await fetch(`/api/${path}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value || null }),
    });
    setEditing(null);
    await onRefresh();
  }

  async function deleteEntity(type: 'objective' | 'kpi' | 'initiative', id: string) {
    const path = type === 'objective' ? 'objectives' : type === 'kpi' ? 'kpis' : 'initiatives';
    await fetch(`/api/${path}/${id}`, { method: 'DELETE' });
    await onRefresh();
  }

  async function saveNewObj(p: Perspective) {
    if (!newObjTitle.trim()) return;
    await fetch('/api/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, perspective: p, title: newObjTitle.trim() }),
    });
    setNewObjTitle('');
    setAddingObjFor(null);
    await onRefresh();
  }

  async function saveNewKpi(objId: string) {
    if (!newKpi.name.trim()) return;
    await fetch('/api/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective_id: objId, ...newKpi }),
    });
    setNewKpi({ name: '', unit: '', baseline: '', target: '', frequency: '' });
    setAddingKpiFor(null);
    await onRefresh();
  }

  async function saveNewInit(objId: string) {
    if (!newInit.name.trim()) return;
    await fetch('/api/initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective_id: objId, ...newInit }),
    });
    setNewInit({ name: '', owner: '', deadline: '', status: 'planned' });
    setAddingInitFor(null);
    await onRefresh();
  }

  // ---- Render an inline-editable cell (called as a function, not a component) ----
  function renderCell(
    type: 'objective' | 'kpi' | 'initiative',
    id: string,
    field: string,
    value: string | null,
    opts: { placeholder?: string; isSelect?: boolean; isDate?: boolean } = {}
  ) {
    const { placeholder, isSelect, isDate } = opts;
    const isEditing = editing?.type === type && editing.id === id && editing.field === field;
    const cellClass = 'block w-full px-1 py-0.5 text-xs bg-blue-50 border border-blue-400 rounded outline-none';

    if (isEditing && isSelect) {
      return (
        <select
          autoFocus
          value={editing!.value}
          onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
          onBlur={() => commitEdit()}
          className={cellClass}
        >
          <option value="planned">{tr('init.status.planned', lang)}</option>
          <option value="active">{tr('init.status.active', lang)}</option>
          <option value="done">{tr('init.status.done', lang)}</option>
        </select>
      );
    }

    if (isEditing) {
      return (
        <input
          autoFocus
          type={isDate ? 'date' : 'text'}
          value={editing!.value}
          onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
          onBlur={() => commitEdit()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(null);
          }}
          className={cellClass}
          placeholder={placeholder}
        />
      );
    }

    const statusColors: Record<string, string> = {
      planned: '#9ca3af',
      active: '#2563eb',
      done: '#059669',
    };

    const display =
      field === 'status' && value ? tr(`init.status.${value}`, lang) : value;

    return (
      <span
        onClick={() => setEditing({ type, id, field, value: value ?? '' })}
        title={lang === 'ka' ? 'დასარედაქტირებლად დააჭირე' : 'Click to edit'}
        className="block cursor-text text-xs px-1 py-0.5 min-h-[20px] rounded hover:bg-blue-50 transition-colors"
        style={
          field === 'status' && value
            ? { color: statusColors[value] || '#374151' }
            : { color: value ? '#374151' : '#d1d5db' }
        }
      >
        {display || '—'}
      </span>
    );
  }

  const th = 'px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50';
  const td = 'px-2 py-1.5 border-b border-gray-100 align-top';

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full border-collapse text-sm" style={{ minWidth: 920 }}>
        <thead>
          <tr>
            <th className={th} style={{ width: '22%' }}>{lang === 'ka' ? 'მიზანი' : 'Objective'}</th>
            <th className={th} style={{ width: '13%' }}>KPI</th>
            <th className={th} style={{ width: '6%' }}>{lang === 'ka' ? 'ერთ.' : 'Unit'}</th>
            <th className={th} style={{ width: '7%' }}>{lang === 'ka' ? 'საწყ.' : 'Base'}</th>
            <th className={th} style={{ width: '7%' }}>{lang === 'ka' ? 'სამ.' : 'Target'}</th>
            <th className={th} style={{ width: '7%' }}>{lang === 'ka' ? 'სიხ.' : 'Freq.'}</th>
            <th className={th} style={{ width: '14%' }}>{lang === 'ka' ? 'ინიციატივა' : 'Initiative'}</th>
            <th className={th} style={{ width: '7%' }}>{lang === 'ka' ? 'პასუხ.' : 'Owner'}</th>
            <th className={th} style={{ width: '7%' }}>{lang === 'ka' ? 'ვადა' : 'Deadline'}</th>
            <th className={th} style={{ width: '6%' }}>{lang === 'ka' ? 'სტ.' : 'Status'}</th>
            <th className={th} style={{ width: '4%' }}></th>
          </tr>
        </thead>
        <tbody>
          {PERSPECTIVES.map((p) => {
            const objs = getObjs(p);
            return (
              <tr key={`__perspective_section_${p}`} style={{ display: 'contents' }}>
                {/* We use tr with display:contents as a React.Fragment key holder */}
              </tr>
            );
          })}
          {PERSPECTIVES.flatMap((p) => {
            const objs = getObjs(p);
            const rows = [];

            // Section header
            rows.push(
              <tr key={`ph-${p}`}>
                <td
                  colSpan={11}
                  className="px-3 py-2 text-xs font-semibold"
                  style={{
                    background: ACCENT[p] + '15',
                    borderLeft: `3px solid ${ACCENT[p]}`,
                    borderBottom: `1px solid ${ACCENT[p]}30`,
                    color: ACCENT[p],
                  }}
                >
                  {PERSPECTIVE_LABELS[p][lang]}
                  <span className="ml-2 font-normal text-gray-500 text-xs">
                    {PERSPECTIVE_DESCRIPTIONS[p][lang]}
                  </span>
                </td>
              </tr>
            );

            // Objective rows
            objs.forEach((obj) => {
              const kpis = obj.kpis;
              const inits = obj.initiatives;
              const rowCount = Math.max(kpis.length, inits.length, 1);

              for (let i = 0; i < rowCount; i++) {
                const kpi: BscKpi | undefined = kpis[i];
                const init: BscInitiative | undefined = inits[i];
                const isFirst = i === 0;
                const isLast = i === rowCount - 1;

                rows.push(
                  <tr
                    key={`${obj.id}-${i}`}
                    className="group hover:bg-blue-50/20"
                    style={{
                      borderLeft: `3px solid ${isFirst ? ACCENT[p] : ACCENT[p] + '40'}`,
                      borderBottom: isLast ? `2px solid #f3f4f6` : undefined,
                    }}
                  >
                    {/* Objective column */}
                    <td className={td} style={isFirst ? {} : { visibility: 'hidden' }}>
                      {isFirst && (
                        <div className="flex items-start gap-1">
                          <div className="flex-1">
                            {renderCell('objective', obj.id, 'title', obj.title, {
                              placeholder: lang === 'ka' ? 'მიზანი...' : 'Objective...',
                            })}
                          </div>
                          <button
                            onClick={() => deleteEntity('objective', obj.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-sm leading-none mt-0.5 shrink-0"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </td>

                    {/* KPI columns */}
                    {kpi ? (
                      <>
                        <td className={td}>{renderCell('kpi', kpi.id, 'name', kpi.name, { placeholder: 'KPI...' })}</td>
                        <td className={td}>{renderCell('kpi', kpi.id, 'unit', kpi.unit, { placeholder: lang === 'ka' ? 'GEL, %...' : 'GEL, %...' })}</td>
                        <td className={td}>{renderCell('kpi', kpi.id, 'baseline', kpi.baseline, { placeholder: lang === 'ka' ? 'ახლა' : 'now' })}</td>
                        <td className={td}>{renderCell('kpi', kpi.id, 'target', kpi.target, { placeholder: lang === 'ka' ? 'სამ.' : 'target' })}</td>
                        <td className={td}>{renderCell('kpi', kpi.id, 'frequency', kpi.frequency, { placeholder: lang === 'ka' ? 'სიხ.' : 'freq' })}</td>
                      </>
                    ) : (
                      <><td className={td} /><td className={td} /><td className={td} /><td className={td} /><td className={td} /></>
                    )}

                    {/* Initiative columns */}
                    {init ? (
                      <>
                        <td className={td}>{renderCell('initiative', init.id, 'name', init.name, { placeholder: lang === 'ka' ? 'ინიციატივა...' : 'Initiative...' })}</td>
                        <td className={td}>{renderCell('initiative', init.id, 'owner', init.owner, { placeholder: lang === 'ka' ? 'ვინ?' : 'who?' })}</td>
                        <td className={td}>{renderCell('initiative', init.id, 'deadline', init.deadline, { isDate: true })}</td>
                        <td className={td}>{renderCell('initiative', init.id, 'status', init.status, { isSelect: true })}</td>
                      </>
                    ) : (
                      <><td className={td} /><td className={td} /><td className={td} /><td className={td} /></>
                    )}

                    {/* Per-row delete actions */}
                    <td className={td}>
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                        {kpi && (
                          <button onClick={() => deleteEntity('kpi', kpi.id)} className="text-gray-300 hover:text-red-400 text-xs leading-none">KPI ×</button>
                        )}
                        {init && (
                          <button onClick={() => deleteEntity('initiative', init.id)} className="text-gray-300 hover:text-red-400 text-xs leading-none">Init ×</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }

              // Add KPI / Add Initiative inline row
              rows.push(
                <tr key={`add-row-${obj.id}`} style={{ borderLeft: '3px solid transparent' }}>
                  <td className="px-2 py-1 border-b border-gray-50" />

                  {/* Add KPI section */}
                  {addingKpiFor === obj.id ? (
                    <>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input
                          autoFocus
                          value={newKpi.name}
                          onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && saveNewKpi(obj.id)}
                          placeholder="KPI..."
                          className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-blue-50 outline-none"
                        />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input value={newKpi.unit} onChange={(e) => setNewKpi({ ...newKpi, unit: e.target.value })} placeholder="GEL,%" className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-blue-50 outline-none" />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input value={newKpi.baseline} onChange={(e) => setNewKpi({ ...newKpi, baseline: e.target.value })} placeholder={lang === 'ka' ? 'ახლა' : 'now'} className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-blue-50 outline-none" />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input value={newKpi.target} onChange={(e) => setNewKpi({ ...newKpi, target: e.target.value })} placeholder={lang === 'ka' ? 'სამ.' : 'target'} className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-blue-50 outline-none" />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input value={newKpi.frequency} onChange={(e) => setNewKpi({ ...newKpi, frequency: e.target.value })} placeholder={lang === 'ka' ? 'სიხ.' : 'freq'} className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 bg-blue-50 outline-none" />
                      </td>
                    </>
                  ) : (
                    <td colSpan={5} className="px-2 py-1 border-b border-gray-50">
                      <button
                        onClick={() => { setAddingKpiFor(obj.id); setAddingInitFor(null); }}
                        className="text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        + {tr('kpi.add', lang)}
                      </button>
                    </td>
                  )}

                  {/* Add Initiative section */}
                  {addingInitFor === obj.id ? (
                    <>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input
                          autoFocus
                          value={newInit.name}
                          onChange={(e) => setNewInit({ ...newInit, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && saveNewInit(obj.id)}
                          placeholder={lang === 'ka' ? 'ინიციატივა...' : 'Initiative...'}
                          className="w-full text-xs border border-orange-300 rounded px-1 py-0.5 bg-orange-50 outline-none"
                        />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input value={newInit.owner} onChange={(e) => setNewInit({ ...newInit, owner: e.target.value })} placeholder={lang === 'ka' ? 'ვინ?' : 'who?'} className="w-full text-xs border border-orange-300 rounded px-1 py-0.5 bg-orange-50 outline-none" />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <input type="date" value={newInit.deadline} onChange={(e) => setNewInit({ ...newInit, deadline: e.target.value })} className="w-full text-xs border border-orange-300 rounded px-1 py-0.5 bg-orange-50 outline-none" />
                      </td>
                      <td className="px-1 py-1 border-b border-gray-50">
                        <select value={newInit.status} onChange={(e) => setNewInit({ ...newInit, status: e.target.value })} className="w-full text-xs border border-orange-300 rounded px-1 py-0.5 bg-orange-50 outline-none">
                          <option value="planned">{tr('init.status.planned', lang)}</option>
                          <option value="active">{tr('init.status.active', lang)}</option>
                          <option value="done">{tr('init.status.done', lang)}</option>
                        </select>
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="px-2 py-1 border-b border-gray-50">
                      <button
                        onClick={() => { setAddingInitFor(obj.id); setAddingKpiFor(null); }}
                        className="text-xs font-medium text-orange-400 hover:text-orange-600 transition-colors"
                      >
                        + {tr('init.add', lang)}
                      </button>
                    </td>
                  )}

                  {/* Save / cancel buttons for add row */}
                  <td className="px-1 py-1 border-b border-gray-50">
                    {(addingKpiFor === obj.id || addingInitFor === obj.id) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => addingKpiFor === obj.id ? saveNewKpi(obj.id) : saveNewInit(obj.id)}
                          className="text-xs text-green-600 hover:text-green-800 font-semibold"
                        >✓</button>
                        <button
                          onClick={() => { setAddingKpiFor(null); setAddingInitFor(null); }}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            });

            // Add objective row
            if (addingObjFor === p) {
              rows.push(
                <tr key={`new-obj-${p}`} style={{ borderLeft: `3px solid ${ACCENT[p]}` }}>
                  <td colSpan={11} className="px-3 py-2 border-b border-gray-100">
                    <div className="flex gap-2 items-center">
                      <input
                        autoFocus
                        value={newObjTitle}
                        onChange={(e) => setNewObjTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveNewObj(p);
                          if (e.key === 'Escape') { setAddingObjFor(null); setNewObjTitle(''); }
                        }}
                        placeholder={lang === 'ka' ? 'ახალი მიზანი...' : 'New objective...'}
                        className="flex-1 text-sm border border-blue-300 rounded px-2 py-1 bg-blue-50 outline-none"
                      />
                      <button
                        onClick={() => saveNewObj(p)}
                        disabled={!newObjTitle.trim()}
                        className="text-xs px-3 py-1 rounded-full text-white disabled:opacity-40"
                        style={{ background: ACCENT[p] }}
                      >
                        {tr('btn.save', lang)}
                      </button>
                      <button onClick={() => { setAddingObjFor(null); setNewObjTitle(''); }} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                  </td>
                </tr>
              );
            } else {
              rows.push(
                <tr key={`add-obj-${p}`} style={{ borderLeft: '3px solid transparent' }}>
                  <td colSpan={11} className="px-3 py-3 border-b border-gray-100">
                    <button
                      onClick={() => { setAddingObjFor(p); setAddingKpiFor(null); setAddingInitFor(null); }}
                      className="text-xs font-medium transition-colors"
                      style={{ color: ACCENT[p] }}
                    >
                      + {lang === 'ka' ? 'მიზნის დამატება' : 'Add Objective'}
                    </button>
                  </td>
                </tr>
              );
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
