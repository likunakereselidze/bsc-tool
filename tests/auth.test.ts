import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../lib/db', () => ({
  default: { query: vi.fn() },
}))

import pool from '../lib/db'
import { NextRequest } from 'next/server'
import {
  getSessionIdFromCookie,
  canWriteObjective,
  canWriteKpi,
  canWriteInitiative,
  canWriteLink,
  canWriteKpiEntry,
} from '../lib/auth'

// Cast for easy mock access
const mockPool = pool as { query: ReturnType<typeof vi.fn> }

function makeRequest(sessionId?: string): NextRequest {
  if (sessionId) {
    return new NextRequest('http://localhost/api/test', {
      headers: { cookie: `bsc_session_id=${sessionId}` },
    })
  }
  return new NextRequest('http://localhost/api/test')
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// getSessionIdFromCookie
// ---------------------------------------------------------------------------

describe('getSessionIdFromCookie', () => {
  it('returns the cookie value when bsc_session_id is present', () => {
    const req = makeRequest('abc-123')
    expect(getSessionIdFromCookie(req)).toBe('abc-123')
  })

  it('returns null when cookie is absent', () => {
    const req = makeRequest()
    expect(getSessionIdFromCookie(req)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// canWriteObjective
// ---------------------------------------------------------------------------

describe('canWriteObjective', () => {
  it('returns false when no session cookie is present', async () => {
    const req = makeRequest()
    const result = await canWriteObjective(req, 'obj-1')
    expect(result).toBe(false)
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('returns true when DB returns rowCount > 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-abc')
    const result = await canWriteObjective(req, 'obj-1')
    expect(result).toBe(true)
  })

  it('returns false when DB returns rowCount = 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const req = makeRequest('session-abc')
    const result = await canWriteObjective(req, 'obj-1')
    expect(result).toBe(false)
  })

  it('queries the bsc_objectives table with objectiveId and sessionId as params', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-xyz')
    await canWriteObjective(req, 'obj-42')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/bsc_objectives/)
    expect(params).toContain('obj-42')
    expect(params).toContain('session-xyz')
  })

  it('handles rowCount = null (treats as 0)', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: null })
    const req = makeRequest('session-abc')
    const result = await canWriteObjective(req, 'obj-1')
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// canWriteKpi
// ---------------------------------------------------------------------------

describe('canWriteKpi', () => {
  it('returns false when no session cookie is present', async () => {
    const req = makeRequest()
    const result = await canWriteKpi(req, 'kpi-1')
    expect(result).toBe(false)
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('returns true when DB returns rowCount > 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-abc')
    expect(await canWriteKpi(req, 'kpi-1')).toBe(true)
  })

  it('returns false when DB returns rowCount = 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const req = makeRequest('session-abc')
    expect(await canWriteKpi(req, 'kpi-1')).toBe(false)
  })

  it('uses a JOIN query through bsc_objectives', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-xyz')
    await canWriteKpi(req, 'kpi-99')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/bsc_kpis/i)
    expect(sql).toMatch(/JOIN\s+bsc_objectives/i)
    expect(params).toContain('kpi-99')
    expect(params).toContain('session-xyz')
  })
})

// ---------------------------------------------------------------------------
// canWriteInitiative
// ---------------------------------------------------------------------------

describe('canWriteInitiative', () => {
  it('returns false when no session cookie is present', async () => {
    const req = makeRequest()
    const result = await canWriteInitiative(req, 'init-1')
    expect(result).toBe(false)
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('returns true when DB returns rowCount > 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-abc')
    expect(await canWriteInitiative(req, 'init-1')).toBe(true)
  })

  it('returns false when DB returns rowCount = 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const req = makeRequest('session-abc')
    expect(await canWriteInitiative(req, 'init-1')).toBe(false)
  })

  it('uses a JOIN query through bsc_objectives', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-xyz')
    await canWriteInitiative(req, 'init-77')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/bsc_initiatives/i)
    expect(sql).toMatch(/JOIN\s+bsc_objectives/i)
    expect(params).toContain('init-77')
    expect(params).toContain('session-xyz')
  })
})

// ---------------------------------------------------------------------------
// canWriteLink
// ---------------------------------------------------------------------------

describe('canWriteLink', () => {
  it('returns false when no session cookie is present', async () => {
    const req = makeRequest()
    const result = await canWriteLink(req, 'link-1')
    expect(result).toBe(false)
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('returns true when DB returns rowCount > 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-abc')
    expect(await canWriteLink(req, 'link-1')).toBe(true)
  })

  it('returns false when DB returns rowCount = 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const req = makeRequest('session-abc')
    expect(await canWriteLink(req, 'link-1')).toBe(false)
  })

  it('queries the strategy_map_links table with linkId and sessionId', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-xyz')
    await canWriteLink(req, 'link-55')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/strategy_map_links/)
    expect(params).toContain('link-55')
    expect(params).toContain('session-xyz')
  })
})

// ---------------------------------------------------------------------------
// canWriteKpiEntry
// ---------------------------------------------------------------------------

describe('canWriteKpiEntry', () => {
  it('returns false when no session cookie is present', async () => {
    const req = makeRequest()
    const result = await canWriteKpiEntry(req, 'entry-1')
    expect(result).toBe(false)
    expect(mockPool.query).not.toHaveBeenCalled()
  })

  it('returns true when DB returns rowCount > 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-abc')
    expect(await canWriteKpiEntry(req, 'entry-1')).toBe(true)
  })

  it('returns false when DB returns rowCount = 0', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const req = makeRequest('session-abc')
    expect(await canWriteKpiEntry(req, 'entry-1')).toBe(false)
  })

  it('uses a double JOIN: kpi_entries → bsc_kpis → bsc_objectives', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
    const req = makeRequest('session-xyz')
    await canWriteKpiEntry(req, 'entry-88')

    const [sql, params] = mockPool.query.mock.calls[0]
    expect(sql).toMatch(/kpi_entries/i)
    expect(sql).toMatch(/bsc_kpis/i)
    expect(sql).toMatch(/bsc_objectives/i)
    expect(params).toContain('entry-88')
    expect(params).toContain('session-xyz')
  })
})
