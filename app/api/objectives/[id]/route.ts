import { NextRequest, NextResponse } from 'next/server';
import { updateObjective, deleteObjective } from '@/lib/bsc-db';
import { canWriteObjective } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteObjective(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const updated = await updateObjective(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/objectives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!await canWriteObjective(req, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteObjective(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/objectives/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
