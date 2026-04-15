import { NextRequest, NextResponse } from 'next/server';
import { updateInitiative, deleteInitiative } from '@/lib/bsc-db';
import { canWriteInitiative } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteInitiative(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const updated = await updateInitiative(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/initiatives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteInitiative(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteInitiative(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/initiatives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
