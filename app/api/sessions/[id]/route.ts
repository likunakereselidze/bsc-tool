import { NextRequest, NextResponse } from 'next/server';
import { getFullSession } from '@/lib/bsc-db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getFullSession(id);

    if (!session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error('GET /api/sessions/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
