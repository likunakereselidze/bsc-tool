import { NextRequest, NextResponse } from 'next/server';
import { createKpi } from '@/lib/bsc-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objective_id, name, unit, baseline, target, frequency } = body;

    if (!objective_id || !name?.trim()) {
      return NextResponse.json({ error: 'objective_id, name required' }, { status: 400 });
    }

    const kpi = await createKpi({
      objective_id,
      name: name.trim(),
      unit: unit?.trim() || undefined,
      baseline: baseline?.trim() || undefined,
      target: target?.trim() || undefined,
      frequency: frequency?.trim() || undefined,
    });

    return NextResponse.json(kpi, { status: 201 });
  } catch (err) {
    console.error('POST /api/kpis', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
