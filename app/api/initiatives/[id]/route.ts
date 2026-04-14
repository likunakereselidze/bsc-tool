import { NextRequest, NextResponse } from 'next/server';
import { updateInitiative, deleteInitiative } from '@/lib/bsc-db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateInitiative(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/initiatives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteInitiative(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/initiatives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
