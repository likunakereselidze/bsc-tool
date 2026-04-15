'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { FullSession, Perspective, Language } from '@/types/bsc';
import { PERSPECTIVES, PERSPECTIVE_LABELS } from '@/types/bsc';
import { tr } from '@/lib/i18n';

const ACCENT: Record<Perspective, string> = {
  financial: '#2563eb',
  customer:  '#059669',
  internal:  '#7c3aed',
  learning:  '#d97706',
};

// Default row layout: Financial top (end goal), Learning bottom (enabler)
const PERSPECTIVE_Y: Record<Perspective, number> = {
  financial: 60,
  customer:  210,
  internal:  360,
  learning:  510,
};

function buildNodes(session: FullSession): Node[] {
  return session.objectives.map((obj) => {
    const siblings = session.objectives.filter((o) => o.perspective === obj.perspective);
    const idx = siblings.indexOf(obj);
    const pos =
      obj.x != null && obj.y != null
        ? { x: obj.x, y: obj.y }
        : { x: 60 + idx * 220, y: PERSPECTIVE_Y[obj.perspective] };

    return {
      id: obj.id,
      position: pos,
      data: {
        label: obj.title,
        perspective: obj.perspective,
        perspLabel: PERSPECTIVE_LABELS[obj.perspective],
      },
      type: 'objective',
    };
  });
}

function buildEdges(session: FullSession): Edge[] {
  return session.strategy_map_links.map((link) => ({
    id: link.id,
    source: link.source_objective_id,
    target: link.target_objective_id,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 16, height: 16 },
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  }));
}

// Custom node rendered as a small card
function ObjectiveNodeComponent({ data }: { data: Record<string, unknown> }) {
  const perspective = data.perspective as Perspective;
  const perspLabel = data.perspLabel as Record<string, string>;
  const label = data.label as string;

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${ACCENT[perspective]}`,
        borderRadius: 10,
        padding: '8px 12px',
        minWidth: 140,
        maxWidth: 180,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        cursor: 'grab',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: ACCENT[perspective],
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {perspLabel['ka'] ?? perspLabel['en']}
      </div>
      <div style={{ fontSize: 11, color: '#1f2937', lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

const nodeTypes = { objective: ObjectiveNodeComponent };

export default function BscStrategyMap({
  session,
  lang,
  onRefresh,
}: {
  session: FullSession;
  lang: Language;
  onRefresh: () => Promise<void>;
}) {
  const initialized = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(session));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(session));

  // Re-sync when session objectives change (e.g. after adding objective in BSC Table)
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return; }
    setNodes((prev) => {
      const newNodes = buildNodes(session);
      // Preserve existing positions for nodes that already exist
      return newNodes.map((n) => {
        const existing = prev.find((p) => p.id === n.id);
        return existing ? { ...n, position: existing.position } : n;
      });
    });
    setEdges(buildEdges(session));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.objectives.length, session.strategy_map_links.length]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;
      // Check for duplicate
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (exists) return;

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          source_objective_id: connection.source,
          target_objective_id: connection.target,
        }),
      });
      if (res.ok) {
        const link = await res.json();
        setEdges((eds) =>
          addEdge(
            {
              id: link.id,
              source: connection.source!,
              target: connection.target!,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 16, height: 16 },
              style: { stroke: '#94a3b8', strokeWidth: 2 },
            },
            eds
          )
        );
        await onRefresh();
      }
    },
    [edges, session.id, onRefresh, setEdges]
  );

  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node) => {
      await fetch(`/api/objectives/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: node.position.x, y: node.position.y }),
      });
    },
    []
  );

  const deleteEdge = useCallback(
    async (edgeId: string) => {
      await fetch(`/api/links/${edgeId}`, { method: 'DELETE' });
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      await onRefresh();
    },
    [onRefresh, setEdges]
  );

  // Intercept edge-change events to block keyboard-delete of edges
  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes.filter((c) => c.type !== 'remove'));
    },
    [onEdgesChange]
  );

  if (session.objectives.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center border border-amber-100 bg-amber-50">
        <p className="text-sm text-amber-700">
          {lang === 'ka'
            ? 'ჯერ BSC ცხრილში დაამატე მიზნები'
            : 'Add objectives in BSC Table first'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
          {tr('map.title', lang)}
        </h2>
        <p className="text-sm text-gray-500">{tr('map.subtitle', lang)}</p>
      </div>

      {/* Causal chain banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-blue-700">{tr('map.chain_label', lang)}:</span>
        {(['learning', 'internal', 'customer', 'financial'] as Perspective[]).map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
              style={{ background: ACCENT[p] }}
            >
              {PERSPECTIVE_LABELS[p][lang]}
            </span>
            {i < 3 && <span className="text-gray-400 text-xs">&rarr;</span>}
          </span>
        ))}
        <span className="text-xs text-blue-600 ml-2">{tr('map.intro', lang)}</span>
      </div>

      {/* React Flow canvas */}
      <div
        className="rounded-2xl border border-gray-200 overflow-hidden"
        style={{ height: 580 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} color="#e5e7eb" gap={20} size={1} />
          <Controls />
          <Panel position="top-right">
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-xs space-y-1.5">
              <p className="font-semibold text-gray-600 mb-1.5">
                {lang === 'ka' ? 'პერსპექტივები' : 'Perspectives'}
              </p>
              {PERSPECTIVES.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ACCENT[p] }} />
                  <span className="text-gray-600">{PERSPECTIVE_LABELS[p][lang]}</span>
                </div>
              ))}
              <p className="text-gray-400 pt-1.5 border-t border-gray-100 leading-relaxed">
                {lang === 'ka'
                  ? 'კავშირი: handle-ს ათრიე\nმეორე node-ზე'
                  : 'Connect: drag from node\nhandle to another node'}
              </p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Connections list */}
      {edges.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">{tr('map.connections_title', lang)}</h3>
          <div className="space-y-1.5">
            {edges.map((edge) => {
              const source = session.objectives.find((o) => o.id === edge.source);
              const target = session.objectives.find((o) => o.id === edge.target);
              if (!source || !target) return null;
              return (
                <div
                  key={edge.id}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-100 bg-gray-50 group flex-wrap"
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0"
                    style={{ background: ACCENT[source.perspective] }}
                  >
                    {PERSPECTIVE_LABELS[source.perspective][lang]}
                  </span>
                  <span className="text-xs font-medium text-gray-800">{source.title}</span>
                  <span className="text-gray-400 text-xs shrink-0">&rarr;</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0"
                    style={{ background: ACCENT[target.perspective] }}
                  >
                    {PERSPECTIVE_LABELS[target.perspective][lang]}
                  </span>
                  <span className="text-xs font-medium text-gray-800">{target.title}</span>
                  <button
                    onClick={() => deleteEdge(edge.id)}
                    className="ml-auto text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none shrink-0"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {edges.length === 0 && (
        <p className="text-xs text-gray-400 italic">{tr('map.no_connections', lang)}</p>
      )}
    </div>
  );
}
