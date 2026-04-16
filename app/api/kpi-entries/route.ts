import { NextRequest, NextResponse } from 'next/server';
import { createKpiEntry, getKpiEntries, getKpiEntriesForSession } from '@/lib/bsc-db';
import { getSessionIdFromCookie, canWriteKpi } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kpi_id = searchParams.get('kpi_id');
    const session_id = searchParams.get('session_id');

    const cookieSession = getSessionIdFromCookie(req);
    if (!cookieSession) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session_id) {
      if (cookieSession !== session_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const entries = await getKpiEntriesForSession(session_id);
      return NextResponse.json(entries);
    }
    if (kpi_id) {
      if (!await canWriteKpi(req, kpi_id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const entries = await getKpiEntries(kpi_id);
      return NextResponse.json(entries);
    }
    return NextResponse.json({ error: 'kpi_id or session_id required' }, { status: 400 });
  } catch (err) {
    console.error('GET /api/kpi-entries', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kpi_id, actual_value, period, note } = body;
    if (!kpi_id || !actual_value) {
      return NextResponse.json({ error: 'kpi_id and actual_value required' }, { status: 400 });
    }
    if (!await canWriteKpi(req, kpi_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const entry = await createKpiEntry({ kpi_id, actual_value, period, note });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error('POST /api/kpi-entries', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
