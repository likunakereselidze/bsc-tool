import { NextRequest, NextResponse } from 'next/server';
import { createInitiative } from '@/lib/bsc-db';
import { canWriteObjective } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objective_id, name, owner, deadline, status } = body;

    if (!objective_id || !name?.trim()) {
      return NextResponse.json({ error: 'objective_id, name required' }, { status: 400 });
    }

    if (!await canWriteObjective(req, objective_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const initiative = await createInitiative({
      objective_id,
      name: name.trim(),
      owner: owner?.trim() || undefined,
      deadline: deadline || undefined,
      status: status || 'planned',
    });

    return NextResponse.json(initiative, { status: 201 });
  } catch (err) {
    console.error('POST /api/initiatives', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
