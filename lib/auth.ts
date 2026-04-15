import { NextRequest } from 'next/server';
import pool from './db';

/**
 * Returns the session_id from the bsc_session_id cookie, or null.
 */
export function getSessionIdFromCookie(req: NextRequest): string | null {
  return req.cookies.get('bsc_session_id')?.value ?? null;
}

/**
 * Verify that an objective belongs to the session in the cookie.
 */
export async function canWriteObjective(req: NextRequest, objectiveId: string): Promise<boolean> {
  const sessionId = getSessionIdFromCookie(req);
  if (!sessionId) return false;
  const res = await pool.query(
    'SELECT 1 FROM bsc_objectives WHERE id = $1 AND session_id = $2',
    [objectiveId, sessionId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Verify that a KPI belongs to the session in the cookie (via objective).
 */
export async function canWriteKpi(req: NextRequest, kpiId: string): Promise<boolean> {
  const sessionId = getSessionIdFromCookie(req);
  if (!sessionId) return false;
  const res = await pool.query(
    `SELECT 1 FROM bsc_kpis k
     JOIN bsc_objectives o ON o.id = k.objective_id
     WHERE k.id = $1 AND o.session_id = $2`,
    [kpiId, sessionId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Verify that an initiative belongs to the session in the cookie (via objective).
 */
export async function canWriteInitiative(req: NextRequest, initiativeId: string): Promise<boolean> {
  const sessionId = getSessionIdFromCookie(req);
  if (!sessionId) return false;
  const res = await pool.query(
    `SELECT 1 FROM bsc_initiatives i
     JOIN bsc_objectives o ON o.id = i.objective_id
     WHERE i.id = $1 AND o.session_id = $2`,
    [initiativeId, sessionId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Verify that a strategy map link belongs to the session in the cookie.
 */
export async function canWriteLink(req: NextRequest, linkId: string): Promise<boolean> {
  const sessionId = getSessionIdFromCookie(req);
  if (!sessionId) return false;
  const res = await pool.query(
    'SELECT 1 FROM strategy_map_links WHERE id = $1 AND session_id = $2',
    [linkId, sessionId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Verify that a KPI entry belongs to the session in the cookie.
 */
export async function canWriteKpiEntry(req: NextRequest, entryId: string): Promise<boolean> {
  const sessionId = getSessionIdFromCookie(req);
  if (!sessionId) return false;
  const res = await pool.query(
    `SELECT 1 FROM kpi_entries ke
     JOIN bsc_kpis k ON k.id = ke.kpi_id
     JOIN bsc_objectives o ON o.id = k.objective_id
     WHERE ke.id = $1 AND o.session_id = $2`,
    [entryId, sessionId]
  );
  return (res.rowCount ?? 0) > 0;
}
