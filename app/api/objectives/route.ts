import { NextRequest, NextResponse } from 'next/server';
import { createObjective } from '@/lib/bsc-db';
import type { Perspective } from '@/types/bsc';

const VALID_PERSPECTIVES: Perspective[] = ['customer', 'financial', 'internal', 'learning'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, perspective, title, description } = body;

    if (!session_id || !perspective || !title?.trim()) {
      return NextResponse.json({ error: 'session_id, perspective, title required' }, { status: 400 });
    }

    if (!VALID_PERSPECTIVES.includes(perspective)) {
      return NextResponse.json({ error: 'Invalid perspective' }, { status: 400 });
    }

    const objective = await createObjective({
      session_id,
      perspective,
      title: title.trim(),
      description: description?.trim() || undefined,
    });

    return NextResponse.json(objective, { status: 201 });
  } catch (err) {
    console.error('POST /api/objectives', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
