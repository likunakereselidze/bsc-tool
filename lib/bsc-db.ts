import pool from './db';
import type {
  BscSession,
  BscObjective,
  BscKpi,
  BscInitiative,
  StrategyMapLink,
  FullSession,
  Language,
  Perspective,
  InitiativeStatus,
  KpiEntry,
} from '@/types/bsc';

// Sessions
export async function updateSession(
  id: string,
  data: { company_name?: string; industry?: string; export_stage?: string }
): Promise<BscSession> {
  const sets: string[] = [];
  const vals: unknown[] = [id];
  let i = 2;
  if (data.company_name !== undefined) { sets.push(`company_name = $${i++}`); vals.push(data.company_name); }
  if (data.industry !== undefined)     { sets.push(`industry = $${i++}`); vals.push(data.industry || null); }
  if (data.export_stage !== undefined) { sets.push(`export_stage = $${i++}`); vals.push(data.export_stage || null); }
  if (sets.length === 0) {
    const res = await pool.query('SELECT * FROM bsc_sessions WHERE id = $1', [id]);
    return res.rows[0];
  }
  sets.push(`updated_at = NOW()`);
  const res = await pool.query(
    `UPDATE bsc_sessions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    vals
  );
  return res.rows[0];
}

export async function createSession(data: {
  company_name: string;
  industry?: string;
  export_stage?: string;
  language: Language;
  full_name?: string;
  email?: string;
}): Promise<BscSession> {
  const res = await pool.query(
    `INSERT INTO bsc_sessions (company_name, industry, export_stage, language, full_name, email)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.company_name, data.industry ?? null, data.export_stage ?? null, data.language,
     data.full_name ?? null, data.email ?? null]
  );
  return res.rows[0];
}

export async function getSession(id: string): Promise<BscSession | null> {
  const res = await pool.query('SELECT * FROM bsc_sessions WHERE id = $1', [id]);
  return res.rows[0] ?? null;
}

export async function getFullSession(id: string): Promise<FullSession | null> {
  const session = await getSession(id);
  if (!session) return null;

  const objRes = await pool.query(
    'SELECT * FROM bsc_objectives WHERE session_id = $1 ORDER BY perspective, sort_order',
    [id]
  );
  const objectives: BscObjective[] = objRes.rows;

  const objIds = objectives.map((o) => o.id);
  let kpis: BscKpi[] = [];
  let initiatives: BscInitiative[] = [];

  if (objIds.length > 0) {
    const kpiRes = await pool.query(
      'SELECT * FROM bsc_kpis WHERE objective_id = ANY($1) ORDER BY sort_order',
      [objIds]
    );
    kpis = kpiRes.rows;

    const initRes = await pool.query(
      'SELECT * FROM bsc_initiatives WHERE objective_id = ANY($1) ORDER BY sort_order',
      [objIds]
    );
    initiatives = initRes.rows;
  }

  const linksRes = await pool.query(
    'SELECT * FROM strategy_map_links WHERE session_id = $1',
    [id]
  );

  return {
    ...session,
    objectives: objectives.map((obj) => ({
      ...obj,
      kpis: kpis.filter((k) => k.objective_id === obj.id),
      initiatives: initiatives.filter((i) => i.objective_id === obj.id),
    })),
    strategy_map_links: linksRes.rows,
  };
}

// Objectives
export async function createObjective(data: {
  session_id: string;
  perspective: Perspective;
  title: string;
  description?: string;
}): Promise<BscObjective> {
  const res = await pool.query(
    `INSERT INTO bsc_objectives (session_id, perspective, title, description, sort_order)
     VALUES ($1, $2::varchar, $3, $4,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM bsc_objectives WHERE session_id = $1 AND perspective = $2::varchar)
     ) RETURNING *`,
    [data.session_id, data.perspective, data.title, data.description ?? null]
  );
  return res.rows[0];
}

export async function updateObjective(
  id: string,
  data: { title?: string; description?: string; x?: number | null; y?: number | null }
): Promise<BscObjective> {
  const res = await pool.query(
    `UPDATE bsc_objectives SET
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       x = CASE WHEN $4::boolean THEN $5::float ELSE x END,
       y = CASE WHEN $6::boolean THEN $7::float ELSE y END
     WHERE id = $1 RETURNING *`,
    [
      id,
      data.title ?? null,
      data.description ?? null,
      'x' in data,
      data.x ?? null,
      'y' in data,
      data.y ?? null,
    ]
  );
  return res.rows[0];
}

export async function deleteObjective(id: string): Promise<void> {
  await pool.query('DELETE FROM bsc_objectives WHERE id = $1', [id]);
}

// KPIs
export async function createKpi(data: {
  objective_id: string;
  name: string;
  unit?: string;
  baseline?: string;
  target?: string;
  frequency?: string;
}): Promise<BscKpi> {
  const res = await pool.query(
    `INSERT INTO bsc_kpis (objective_id, name, unit, baseline, target, frequency, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM bsc_kpis WHERE objective_id = $1)
     ) RETURNING *`,
    [data.objective_id, data.name, data.unit ?? null, data.baseline ?? null,
     data.target ?? null, data.frequency ?? null]
  );
  return res.rows[0];
}

export async function updateKpi(
  id: string,
  data: { name?: string; unit?: string; baseline?: string; target?: string; frequency?: string }
): Promise<BscKpi> {
  const res = await pool.query(
    `UPDATE bsc_kpis SET
       name = COALESCE($2, name),
       unit = COALESCE($3, unit),
       baseline = COALESCE($4, baseline),
       target = COALESCE($5, target),
       frequency = COALESCE($6, frequency)
     WHERE id = $1 RETURNING *`,
    [id, data.name ?? null, data.unit ?? null, data.baseline ?? null,
     data.target ?? null, data.frequency ?? null]
  );
  return res.rows[0];
}

export async function deleteKpi(id: string): Promise<void> {
  await pool.query('DELETE FROM bsc_kpis WHERE id = $1', [id]);
}

// Initiatives
export async function createInitiative(data: {
  objective_id: string;
  name: string;
  owner?: string;
  deadline?: string;
  status?: InitiativeStatus;
}): Promise<BscInitiative> {
  const res = await pool.query(
    `INSERT INTO bsc_initiatives (objective_id, name, owner, deadline, status, sort_order)
     VALUES ($1, $2, $3, $4, $5,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM bsc_initiatives WHERE objective_id = $1)
     ) RETURNING *`,
    [data.objective_id, data.name, data.owner ?? null,
     data.deadline ?? null, data.status ?? 'planned']
  );
  return res.rows[0];
}

export async function updateInitiative(
  id: string,
  data: { name?: string; owner?: string; deadline?: string; status?: InitiativeStatus }
): Promise<BscInitiative> {
  const res = await pool.query(
    `UPDATE bsc_initiatives SET
       name = COALESCE($2, name),
       owner = COALESCE($3, owner),
       deadline = COALESCE($4, deadline),
       status = COALESCE($5, status)
     WHERE id = $1 RETURNING *`,
    [id, data.name ?? null, data.owner ?? null, data.deadline ?? null, data.status ?? null]
  );
  return res.rows[0];
}

export async function deleteInitiative(id: string): Promise<void> {
  await pool.query('DELETE FROM bsc_initiatives WHERE id = $1', [id]);
}

// KPI entries (actuals)
export async function createKpiEntry(data: {
  kpi_id: string;
  actual_value: string;
  period?: string;
  note?: string;
}): Promise<KpiEntry> {
  const res = await pool.query(
    `INSERT INTO kpi_entries (kpi_id, actual_value, period, note)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.kpi_id, data.actual_value, data.period ?? null, data.note ?? null]
  );
  return res.rows[0];
}

export async function getKpiEntries(kpi_id: string): Promise<KpiEntry[]> {
  const res = await pool.query(
    'SELECT * FROM kpi_entries WHERE kpi_id = $1 ORDER BY created_at DESC',
    [kpi_id]
  );
  return res.rows;
}

export async function getKpiEntriesForSession(session_id: string): Promise<KpiEntry[]> {
  const res = await pool.query(
    `SELECT ke.* FROM kpi_entries ke
     JOIN bsc_kpis k ON k.id = ke.kpi_id
     JOIN bsc_objectives o ON o.id = k.objective_id
     WHERE o.session_id = $1
     ORDER BY ke.created_at DESC`,
    [session_id]
  );
  return res.rows;
}

export async function deleteKpiEntry(id: string): Promise<void> {
  await pool.query('DELETE FROM kpi_entries WHERE id = $1', [id]);
}

// Strategy map links
export async function createLink(data: {
  session_id: string;
  source_objective_id: string;
  target_objective_id: string;
}): Promise<StrategyMapLink> {
  const res = await pool.query(
    `INSERT INTO strategy_map_links (session_id, source_objective_id, target_objective_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (source_objective_id, target_objective_id) DO NOTHING
     RETURNING *`,
    [data.session_id, data.source_objective_id, data.target_objective_id]
  );
  return res.rows[0];
}

export async function deleteLink(id: string): Promise<void> {
  await pool.query('DELETE FROM strategy_map_links WHERE id = $1', [id]);
}
