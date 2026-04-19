import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../lib/db', () => ({
  default: { query: vi.fn() },
}))

import pool from '../lib/db'
import {
  updateSession,
  createSession,
  getSession,
  getFullSession,
  createObjective,
  updateObjective,
  deleteObjective,
  createKpi,
  updateKpi,
  deleteKpi,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  createLink,
} from '../lib/bsc-db'

const mockPool = pool as { query: ReturnType<typeof vi.fn> }

// Minimal fixture factories
const makeSession = (overrides = {}) => ({
  id: 'sess-1',
  company_name: 'Acme',
  industry: null,
  export_stage: null,
  language: 'en',
  paid_tier: false,
  full_name: null,
  email: null,
  ai_generations_used: 0,
  paid_tier_plan: null,
  nudge1_sent_at: null,
  nudge2_sent_at: null,
  completion_email_sent_at: null,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
  ...overrides,
})

const makeObjective = (overrides = {}) => ({
  id: 'obj-1',
  session_id: 'sess-1',
  perspective: 'financial',
  title: 'Grow Revenue',
  description: null,
  sort_order: 0,
  x: null,
  y: null,
  created_at: '2025-01-01',
  ...overrides,
})

const makeKpi = (overrides = {}) => ({
  id: 'kpi-1',
  objective_id: 'obj-1',
  name: 'Revenue',
  unit: 'USD',
  baseline: null,
  target: null,
  frequency: null,
  sort_order: 0,
  created_at: '2025-01-01',
  ...overrides,
})

const makeInitiative = (overrides = {}) => ({
  id: 'init-1',
  objective_id: 'obj-1',
  name: 'Launch new market',
  owner: null,
  deadline: null,
  status: 'planned',
  sort_order: 0,
  created_at: '2025-01-01',
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// updateSession
// ---------------------------------------------------------------------------

describe('updateSession', () => {
  it('runs SELECT and returns row when no fields provided', async () => {
    const row = makeSession()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await updateSession('sess-1', {})

    expect(mockPool.query).toHaveBeenCalledTimes(1)
    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/SELECT/i)
    expect(params).toContain('sess-1')
    expect(result).toEqual(row)
  })

  it('runs UPDATE with SET clause for company_name when provided', async () => {
    const row = makeSession({ company_name: 'NewCo' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await updateSession('sess-1', { company_name: 'NewCo' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/UPDATE/i)
    expect(sql).toMatch(/company_name/)
    expect(params).toContain('NewCo')
    expect(params).toContain('sess-1')
    expect(result).toEqual(row)
  })

  it('includes all provided fields in SET clause', async () => {
    const row = makeSession({ company_name: 'NewCo', industry: 'Wine', export_stage: 'scaling' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    await updateSession('sess-1', {
      company_name: 'NewCo',
      industry: 'Wine',
      export_stage: 'scaling',
    })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/company_name/)
    expect(sql).toMatch(/industry/)
    expect(sql).toMatch(/export_stage/)
    expect(params).toContain('NewCo')
    expect(params).toContain('Wine')
    expect(params).toContain('scaling')
  })

  it('sets updated_at = NOW() in the UPDATE query', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeSession()], rowCount: 1 })
    await updateSession('sess-1', { company_name: 'Test' })

    const [sql] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/updated_at\s*=\s*NOW\(\)/i)
  })

  it('stores null for empty industry/export_stage string', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeSession()], rowCount: 1 })
    await updateSession('sess-1', { industry: '', export_stage: '' })

    const [, params] = mockPool.query.mock.calls[0]
    // empty strings coerce to null in the implementation
    expect(params).toContain(null)
  })
})

// ---------------------------------------------------------------------------
// createSession
// ---------------------------------------------------------------------------

describe('createSession', () => {
  it('calls INSERT with all provided fields', async () => {
    const row = makeSession({ company_name: 'Vine Export', language: 'ka' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createSession({
      company_name: 'Vine Export',
      language: 'ka',
      industry: 'Wine',
      export_stage: 'active_export',
      full_name: 'Lia',
      email: 'lia@example.com',
    })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO bsc_sessions/i)
    expect(params).toContain('Vine Export')
    expect(params).toContain('ka')
    expect(params).toContain('Wine')
    expect(params).toContain('active_export')
    expect(params).toContain('Lia')
    expect(params).toContain('lia@example.com')
    expect(result).toEqual(row)
  })

  it('uses null for optional fields not provided', async () => {
    const row = makeSession()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    await createSession({ company_name: 'Minimal Co', language: 'en' })

    const [, params] = mockPool.query.mock.calls[0]
    // industry, export_stage, full_name, email all default to null
    const nullCount = params.filter((p: unknown) => p === null).length
    expect(nullCount).toBeGreaterThanOrEqual(4)
  })

  it('returns the created row', async () => {
    const row = makeSession({ id: 'new-sess' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createSession({ company_name: 'Test', language: 'en' })
    expect(result).toEqual(row)
  })
})

// ---------------------------------------------------------------------------
// getSession
// ---------------------------------------------------------------------------

describe('getSession', () => {
  it('returns the row when found', async () => {
    const row = makeSession()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await getSession('sess-1')
    expect(result).toEqual(row)
  })

  it('returns null when not found (empty rows)', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const result = await getSession('nonexistent')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getFullSession
// ---------------------------------------------------------------------------

describe('getFullSession', () => {
  it('returns null when session is not found', async () => {
    // getSession call
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const result = await getFullSession('nonexistent')
    expect(result).toBeNull()
  })

  it('returns full session with empty objectives when none exist', async () => {
    const session = makeSession()
    mockPool.query
      .mockResolvedValueOnce({ rows: [session], rowCount: 1 })  // getSession
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })          // objectives query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })          // strategy_map_links query

    const result = await getFullSession('sess-1')

    expect(result).not.toBeNull()
    expect(result!.objectives).toEqual([])
    expect(result!.strategy_map_links).toEqual([])
  })

  it('does not query kpis/initiatives when no objectives exist', async () => {
    const session = makeSession()
    mockPool.query
      .mockResolvedValueOnce({ rows: [session], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    await getFullSession('sess-1')

    // Calls: getSession SELECT, objectives SELECT, strategy_map_links SELECT
    // No kpi/initiative queries because objIds.length === 0
    expect(mockPool.query).toHaveBeenCalledTimes(3)
  })

  it('returns full session with objectives, kpis, and initiatives grouped correctly', async () => {
    const session = makeSession()
    const obj1 = makeObjective({ id: 'obj-1', session_id: 'sess-1' })
    const obj2 = makeObjective({ id: 'obj-2', session_id: 'sess-1', perspective: 'customer' })
    const kpi1 = makeKpi({ id: 'kpi-1', objective_id: 'obj-1' })
    const kpi2 = makeKpi({ id: 'kpi-2', objective_id: 'obj-2' })
    const init1 = makeInitiative({ id: 'init-1', objective_id: 'obj-1' })
    const link1 = { id: 'link-1', session_id: 'sess-1', source_objective_id: 'obj-1', target_objective_id: 'obj-2', created_at: '2025-01-01' }

    mockPool.query
      .mockResolvedValueOnce({ rows: [session], rowCount: 1 })           // getSession
      .mockResolvedValueOnce({ rows: [obj1, obj2], rowCount: 2 })        // objectives
      .mockResolvedValueOnce({ rows: [kpi1, kpi2], rowCount: 2 })        // kpis
      .mockResolvedValueOnce({ rows: [init1], rowCount: 1 })             // initiatives
      .mockResolvedValueOnce({ rows: [link1], rowCount: 1 })             // links

    const result = await getFullSession('sess-1')

    expect(result).not.toBeNull()
    expect(result!.objectives).toHaveLength(2)

    const resultObj1 = result!.objectives.find((o) => o.id === 'obj-1')!
    expect(resultObj1.kpis).toEqual([kpi1])
    expect(resultObj1.initiatives).toEqual([init1])

    const resultObj2 = result!.objectives.find((o) => o.id === 'obj-2')!
    expect(resultObj2.kpis).toEqual([kpi2])
    expect(resultObj2.initiatives).toEqual([])

    expect(result!.strategy_map_links).toEqual([link1])
  })

  it('queries kpis and initiatives when objectives are present', async () => {
    const session = makeSession()
    const obj = makeObjective()
    mockPool.query
      .mockResolvedValueOnce({ rows: [session], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [obj], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })   // kpis
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })   // initiatives
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })   // links

    await getFullSession('sess-1')
    // getSession + objectives + kpis + initiatives + links = 5
    expect(mockPool.query).toHaveBeenCalledTimes(5)
  })
})

// ---------------------------------------------------------------------------
// createObjective
// ---------------------------------------------------------------------------

describe('createObjective', () => {
  it('calls INSERT with session_id, perspective, title', async () => {
    const row = makeObjective()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createObjective({
      session_id: 'sess-1',
      perspective: 'financial',
      title: 'Grow Revenue',
    })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO bsc_objectives/i)
    expect(params).toContain('sess-1')
    expect(params).toContain('financial')
    expect(params).toContain('Grow Revenue')
    expect(result).toEqual(row)
  })

  it('uses a sort_order subquery with COALESCE(MAX(sort_order), -1) + 1', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeObjective()], rowCount: 1 })
    await createObjective({ session_id: 'sess-1', perspective: 'customer', title: 'Test' })

    const [sql] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/COALESCE\(MAX\(sort_order\)/i)
  })

  it('uses null for description when not provided', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeObjective()], rowCount: 1 })
    await createObjective({ session_id: 'sess-1', perspective: 'internal', title: 'Test' })

    const [, params] = mockPool.query.mock.calls[0]
    expect(params).toContain(null)
  })
})

// ---------------------------------------------------------------------------
// updateObjective
// ---------------------------------------------------------------------------

describe('updateObjective', () => {
  it('uses COALESCE pattern for title and description', async () => {
    const row = makeObjective({ title: 'Updated' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await updateObjective('obj-1', { title: 'Updated' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/COALESCE/i)
    expect(sql).toMatch(/UPDATE bsc_objectives/i)
    expect(params).toContain('obj-1')
    expect(result).toEqual(row)
  })

  it('passes x/y with CASE WHEN boolean flag pattern', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeObjective({ x: 100, y: 200 })], rowCount: 1 })
    await updateObjective('obj-1', { x: 100, y: 200 })

    const [sql, params] = mockPool.query.mock.calls[0]
    // The implementation uses CASE WHEN $4::boolean THEN $5::float ELSE x END
    expect(sql).toMatch(/CASE WHEN/i)
    expect(params).toContain(true)  // 'x' in data
    expect(params).toContain(100)
  })

  it('passes x/y flags as false when not in data', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeObjective()], rowCount: 1 })
    await updateObjective('obj-1', { title: 'No coords' })

    const [, params] = mockPool.query.mock.calls[0]
    expect(params).toContain(false) // 'x' not in data
  })
})

// ---------------------------------------------------------------------------
// deleteObjective
// ---------------------------------------------------------------------------

describe('deleteObjective', () => {
  it('calls DELETE WHERE id = $1', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })
    await deleteObjective('obj-1')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/DELETE FROM bsc_objectives/i)
    expect(params).toContain('obj-1')
  })
})

// ---------------------------------------------------------------------------
// createKpi
// ---------------------------------------------------------------------------

describe('createKpi', () => {
  it('calls INSERT with objective_id and name', async () => {
    const row = makeKpi()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createKpi({ objective_id: 'obj-1', name: 'Revenue' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO bsc_kpis/i)
    expect(params).toContain('obj-1')
    expect(params).toContain('Revenue')
    expect(result).toEqual(row)
  })

  it('uses a sort_order subquery', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeKpi()], rowCount: 1 })
    await createKpi({ objective_id: 'obj-1', name: 'Test KPI' })

    const [sql] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/COALESCE\(MAX\(sort_order\)/i)
  })

  it('uses null for optional fields not provided', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeKpi()], rowCount: 1 })
    await createKpi({ objective_id: 'obj-1', name: 'Test KPI' })

    const [, params] = mockPool.query.mock.calls[0]
    const nullCount = params.filter((p: unknown) => p === null).length
    expect(nullCount).toBeGreaterThanOrEqual(3) // unit, baseline, target, frequency default to null
  })
})

// ---------------------------------------------------------------------------
// updateKpi
// ---------------------------------------------------------------------------

describe('updateKpi', () => {
  it('uses COALESCE pattern and updates correct table', async () => {
    const row = makeKpi({ name: 'Updated KPI' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await updateKpi('kpi-1', { name: 'Updated KPI' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/UPDATE bsc_kpis/i)
    expect(sql).toMatch(/COALESCE/i)
    expect(params).toContain('kpi-1')
    expect(result).toEqual(row)
  })
})

// ---------------------------------------------------------------------------
// deleteKpi
// ---------------------------------------------------------------------------

describe('deleteKpi', () => {
  it('calls DELETE FROM bsc_kpis WHERE id = $1', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })
    await deleteKpi('kpi-1')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/DELETE FROM bsc_kpis/i)
    expect(params).toContain('kpi-1')
  })
})

// ---------------------------------------------------------------------------
// createInitiative
// ---------------------------------------------------------------------------

describe('createInitiative', () => {
  it('calls INSERT with objective_id and name', async () => {
    const row = makeInitiative()
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createInitiative({ objective_id: 'obj-1', name: 'Launch market' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO bsc_initiatives/i)
    expect(params).toContain('obj-1')
    expect(params).toContain('Launch market')
    expect(result).toEqual(row)
  })

  it('defaults status to "planned" when not provided', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeInitiative()], rowCount: 1 })
    await createInitiative({ objective_id: 'obj-1', name: 'Test' })

    const [, params] = mockPool.query.mock.calls[0]
    expect(params).toContain('planned')
  })

  it('uses the provided status when given', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeInitiative({ status: 'active' })], rowCount: 1 })
    await createInitiative({ objective_id: 'obj-1', name: 'Test', status: 'active' })

    const [, params] = mockPool.query.mock.calls[0]
    expect(params).toContain('active')
    expect(params).not.toContain('planned')
  })

  it('uses null for owner and deadline when not provided', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeInitiative()], rowCount: 1 })
    await createInitiative({ objective_id: 'obj-1', name: 'Test' })

    const [, params] = mockPool.query.mock.calls[0]
    const nullCount = params.filter((p: unknown) => p === null).length
    expect(nullCount).toBeGreaterThanOrEqual(2)
  })

  it('uses a sort_order subquery', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeInitiative()], rowCount: 1 })
    await createInitiative({ objective_id: 'obj-1', name: 'Test' })

    const [sql] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/COALESCE\(MAX\(sort_order\)/i)
  })
})

// ---------------------------------------------------------------------------
// updateInitiative
// ---------------------------------------------------------------------------

describe('updateInitiative', () => {
  it('uses COALESCE pattern and updates correct table', async () => {
    const row = makeInitiative({ name: 'Updated' })
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await updateInitiative('init-1', { name: 'Updated' })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/UPDATE bsc_initiatives/i)
    expect(sql).toMatch(/COALESCE/i)
    expect(params).toContain('init-1')
    expect(result).toEqual(row)
  })

  it('passes null for status when not provided', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [makeInitiative()], rowCount: 1 })
    await updateInitiative('init-1', { name: 'New name' })

    const [, params] = mockPool.query.mock.calls[0]
    // status defaults to null in the implementation
    expect(params).toContain(null)
  })
})

// ---------------------------------------------------------------------------
// deleteInitiative
// ---------------------------------------------------------------------------

describe('deleteInitiative', () => {
  it('calls DELETE FROM bsc_initiatives WHERE id = $1', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })
    await deleteInitiative('init-1')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/DELETE FROM bsc_initiatives/i)
    expect(params).toContain('init-1')
  })
})

// ---------------------------------------------------------------------------
// createLink
// ---------------------------------------------------------------------------

describe('createLink', () => {
  it('calls INSERT with session_id, source_objective_id, target_objective_id', async () => {
    const row = { id: 'link-1', session_id: 'sess-1', source_objective_id: 'obj-1', target_objective_id: 'obj-2', created_at: '2025-01-01' }
    mockPool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 })

    const result = await createLink({
      session_id: 'sess-1',
      source_objective_id: 'obj-1',
      target_objective_id: 'obj-2',
    })

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/INSERT INTO strategy_map_links/i)
    expect(params).toContain('sess-1')
    expect(params).toContain('obj-1')
    expect(params).toContain('obj-2')
    expect(result).toEqual(row)
  })

  it('uses ON CONFLICT DO NOTHING to handle duplicate links', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    await createLink({ session_id: 'sess-1', source_objective_id: 'obj-1', target_objective_id: 'obj-2' })

    const [sql] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/ON CONFLICT.*DO NOTHING/i)
  })

  it('returns undefined (rows[0]) when a conflict occurs and rows is empty', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const result = await createLink({
      session_id: 'sess-1',
      source_objective_id: 'obj-1',
      target_objective_id: 'obj-2',
    })

    expect(result).toBeUndefined()
  })
})
