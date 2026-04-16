import { NextRequest, NextResponse } from 'next/server';
import { getFullSession, updateSession } from '@/lib/bsc-db';
import { getSessionIdFromCookie } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (getSessionIdFromCookie(req) !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const session = await getFullSession(id);
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(session);
  } catch (err) {
    console.error('GET /api/sessions/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (getSessionIdFromCookie(req) !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const updated = await updateSession(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/sessions/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
