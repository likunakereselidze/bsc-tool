import { NextRequest, NextResponse } from 'next/server';
import { createLink } from '@/lib/bsc-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, source_objective_id, target_objective_id } = body;

    if (!session_id || !source_objective_id || !target_objective_id) {
      return NextResponse.json({ error: 'session_id, source_objective_id, target_objective_id required' }, { status: 400 });
    }
    if (source_objective_id === target_objective_id) {
      return NextResponse.json({ error: 'Source and target must differ' }, { status: 400 });
    }

    const link = await createLink({ session_id, source_objective_id, target_objective_id });
    return NextResponse.json(link ?? { ok: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/links', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
